import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    Plus,
    MapPin,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Search,
    Filter,
    Mail,
    Phone,
    FilterX,
    PlusCircle,
    Navigation,
    Home,
    ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export default function JobOpportunities() {
    const { profile, role } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Job Dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newJob, setNewJob] = useState({
        title: "",
        description: "",
        teacher_type: "academic",
        location: ""
    });
    const [creating, setCreating] = useState(false);

    // View Applications Dialog
    const [viewAppsOpen, setViewAppsOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [jobApps, setJobApps] = useState<any[]>([]);
    const [loadingApps, setLoadingApps] = useState(false);

    // Apply Dialog
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);
    const [applyingTo, setApplyingTo] = useState<any>(null);
    const [applying, setApplying] = useState(false);

    // Nearby Search (Geoapify)
    const [nearbyOrgs, setNearbyOrgs] = useState<any[]>([]);
    const [searchingNearby, setSearchingNearby] = useState(false);
    const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);

    const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || "387c124874b34691999863ac35f5287f"; // Fallback to test key if not set

    useEffect(() => {
        fetchJobs();
        if (role === 'teacher') fetchMyApplications();
    }, [profile, role]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            let query = supabase.from("job_openings").select("*");

            if (role === 'owner') {
                query = query.eq("owner_id", profile?.id);
            }

            const { data, error } = await query.order("created_at", { ascending: false });
            if (error) throw error;
            setJobs(data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const fetchMyApplications = async () => {
        try {
            const { data, error } = await supabase
                .from("job_applications")
                .select("job_id, status")
                .eq("teacher_id", profile?.id);

            if (error) throw error;
            setApplications(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchApplicationsForJob = async (job: any) => {
        setSelectedJob(job);
        setViewAppsOpen(true);
        setLoadingApps(true);
        try {
            const { data, error } = await supabase
                .from("job_applications")
                .select(`
                    id,
                    status,
                    created_at,
                    profiles:teacher_id (
                        id,
                        full_name,
                        email,
                        phone,
                        teacher_type
                    )
                `)
                .eq("job_id", job.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setJobApps(data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load applications");
        } finally {
            setLoadingApps(false);
        }
    };

    const handleUpdateApplicationStatus = async (appId: string, status: string) => {
        try {
            const { error } = await supabase
                .from("job_applications")
                .update({ status })
                .eq("id", appId);

            if (error) throw error;

            toast.success(`Application ${status}`);
            if (selectedJob) fetchApplicationsForJob(selectedJob);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update application");
        }
    };

    const handleCreateJob = async () => {
        if (!newJob.title || !newJob.description || !newJob.location) {
            toast.error("Please fill in all required fields");
            return;
        }

        setCreating(true);
        try {
            const { error } = await supabase.from("job_openings").insert({
                ...newJob,
                owner_id: profile?.id
            });

            if (error) throw error;

            toast.success("Job posting created!");
            setCreateDialogOpen(false);
            setNewJob({ title: "", description: "", teacher_type: "academic", location: "" });
            fetchJobs();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create job");
        } finally {
            setCreating(false);
        }
    };

    const handleConfirmApply = async () => {
        if (!applyingTo) return;
        setApplying(true);
        try {
            const { error } = await supabase.from("job_applications").insert({
                job_id: applyingTo.id,
                teacher_id: profile?.id,
                status: 'pending'
            });

            if (error) throw error;

            toast.success("Application submitted successfully!");
            setApplyDialogOpen(false);
            setApplyingTo(null);
            fetchMyApplications();
        } catch (err: any) {
            if (err.code === '23505') {
                toast.error("You've already applied for this role");
            } else {
                console.error(err);
                toast.error("Failed to submit application");
            }
        } finally {
            setApplying(false);
        }
    };

    const handleApply = (job: any) => {
        setApplyingTo(job);
        setApplyDialogOpen(true);
    };

    const handleFindNearby = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setSearchingNearby(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                setLocation(coords);
                fetchNearbyOrgs(coords);
            },
            (err) => {
                console.error(err);
                if (err.code === 1) {
                    toast.error("Location access denied. Please enable it in browser settings.");
                } else {
                    toast.error("Failed to get your location.");
                }
                setSearchingNearby(false);
            }
        );
    };

    const fetchNearbyOrgs = async (coords: { lat: number, lon: number }) => {
        try {
            const typeMap: any = {
                academic: "education.school,education.university",
                music: "education.music_school",
                sports: "leisure.sports_centre,sports.sports_centre",
                language: "education.language_school",
                other: "education"
            };

            const category = typeMap[profile?.teacher_type || 'academic'] || "education";

            const response = await fetch(
                `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${coords.lon},${coords.lat},5000&bias=proximity:${coords.lon},${coords.lat}&limit=12&apiKey=${GEOAPIFY_KEY}`
            );

            const result = await response.json();

            if (result.features) {
                const orgs = result.features.map((f: any) => ({
                    name: f.properties.name || f.properties.street || "Organization",
                    address: f.properties.address_line2 || f.properties.city,
                    distance: Math.round(f.properties.distance) / 1000,
                    lat: f.properties.lat,
                    lon: f.properties.lon,
                    category: f.properties.categories[0]?.split('.').pop()?.replace('_', ' ') || 'Organization'
                }));
                setNearbyOrgs(orgs);
                if (orgs.length === 0) toast.info("No organizations found nearby.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch nearby organizations");
        } finally {
            setSearchingNearby(false);
        }
    };

    const isApplied = (jobId: string) => {
        return applications.some(a => a.job_id === jobId);
    };

    const getApplicationStatus = (jobId: string) => {
        return applications.find(a => a.job_id === jobId)?.status;
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-display mb-1">Job Opportunities</h1>
                        <p className="text-muted-foreground">Finding new opportunities...</p>
                    </div>
                </div>
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">
                        Scanning the horizon...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-1">Job Opportunities</h1>
                    <p className="text-muted-foreground">
                        {role === 'owner'
                            ? "Manage your organization's job postings."
                            : "Browse and apply for teaching roles in your organization."}
                    </p>
                </div>
                {role === 'owner' && (
                    <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 rounded-xl">
                        <Plus className="h-4 w-4" />
                        Post New Job
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs by title or location..."
                        className="pl-10 h-12 rounded-2xl bg-muted/20 border-none shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-12 w-12 rounded-2xl md:w-auto md:px-4">
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:ml-2 md:inline">Sort</span>
                </Button>
            </div>

            {role === 'teacher' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 bg-primary/5 p-6 rounded-3xl border border-primary/10"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Navigation className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black">Nearby Opportunities</h2>
                                <p className="text-xs text-muted-foreground">Find schools and academies near your location</p>
                            </div>
                        </div>
                        <Button
                            className="rounded-xl px-6 h-11 bg-primary shadow-lg shadow-primary/20"
                            onClick={handleFindNearby}
                            disabled={searchingNearby}
                        >
                            {searchingNearby ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                                    Searching...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    {nearbyOrgs.length > 0 ? "Refresh Search" : "Search Nearby"}
                                </span>
                            )}
                        </Button>
                    </div>

                    {nearbyOrgs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {nearbyOrgs.map((org, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card className="p-4 bg-background border-muted/50 hover:shadow-xl hover:-translate-y-1 transition-all group h-full flex flex-col justify-between overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Navigation className="h-12 w-12 -rotate-12" />
                                        </div>
                                        <div className="relative">
                                            <div className="flex justify-between items-start gap-2 mb-3">
                                                <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-widest bg-primary/5 text-primary border-none">
                                                    {org.category}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                                                    <MapPin className="h-3 w-3" />
                                                    {org.distance} km
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{org.name}</h3>
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{org.address}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="w-full mt-4 h-9 text-[11px] gap-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all transform"
                                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${org.name} ${org.address}`, '_blank')}
                                        >
                                            View on Maps
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (location && !searchingNearby && (
                        <div className="py-12 text-center text-muted-foreground bg-background/50 rounded-2xl border-2 border-dashed">
                            <p className="text-sm font-medium">No organizations found within 5km.</p>
                            <p className="text-[10px] mt-1 opacity-50">Try broadening your teacher type in account settings.</p>
                        </div>
                    ))}
                </motion.div>
            )}

            {filteredJobs.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12"
                >
                    <Card className="p-16 text-center border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                            {searchQuery ? (
                                <FilterX className="h-10 w-10 text-muted-foreground/40" />
                            ) : (
                                <Briefcase className="h-10 w-10 text-muted-foreground/40" />
                            )}
                        </div>
                        <h3 className="text-2xl font-black mb-2">
                            {searchQuery ? "No matching roles" : "No active opportunities"}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                            {searchQuery
                                ? `We couldn't find any job postings matching "${searchQuery}". Try adjusting your search.`
                                : role === 'owner'
                                    ? "You haven't posted any jobs yet. Start building your team by posting your first teaching vacancy."
                                    : "There are no active job openings at this time. Check back soon for new opportunities in your org."}
                        </p>

                        {searchQuery ? (
                            <Button
                                variant="outline"
                                onClick={() => setSearchQuery("")}
                                className="rounded-xl px-8"
                            >
                                Clear Search
                            </Button>
                        ) : role === 'owner' && (
                            <Button onClick={() => setCreateDialogOpen(true)} className="rounded-xl px-8 gap-2 shadow-lg shadow-primary/20">
                                <PlusCircle className="h-4 w-4" />
                                Post Your First Job
                            </Button>
                        )}
                    </Card>
                </motion.div>
            ) : (
                <div className="grid gap-6">
                    {filteredJobs.map((job, index) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-all border-muted/50 group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest">
                                                {job.teacher_type}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Posted {formatDate(job.created_at)}
                                            </span>
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-black group-hover:text-primary transition-colors">{job.title}</h2>
                                            <p className="text-muted-foreground mt-2 line-clamp-2 md:line-clamp-none max-w-2xl">{job.description}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm font-medium">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {job.location}
                                            </div>
                                            {role === 'owner' && (
                                                <Button
                                                    variant="ghost"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full hover:bg-muted font-medium text-primary"
                                                    onClick={() => fetchApplicationsForJob(job)}
                                                >
                                                    <Users className="h-4 w-4" />
                                                    View Applications
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
                                        {role === 'teacher' ? (
                                            isApplied(job.id) ? (
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge className={`px-4 py-2 rounded-xl border-none ${getApplicationStatus(job.id) === 'accepted' ? 'bg-success' :
                                                        getApplicationStatus(job.id) === 'rejected' ? 'bg-destructive' : 'bg-warning'
                                                        }`}>
                                                        {getApplicationStatus(job.id).toUpperCase()}
                                                    </Badge>
                                                    <p className="text-[10px] text-muted-foreground px-1">Application Status</p>
                                                </div>
                                            ) : (
                                                <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20" onClick={() => handleApply(job)}>
                                                    Apply Now
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            )
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="rounded-xl">Edit</Button>
                                                <Button variant="destructive" className="rounded-xl">Delete</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Apply Confirmation Dialog */}
            <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Application</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-black mb-2">{applyingTo?.title}</h3>
                        <p className="text-muted-foreground text-sm">
                            Are you sure you want to apply for this teaching role at {profile?.organization_name || "the organization"}?
                            Your profile and contact details will be shared with the organization owner.
                        </p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="ghost" onClick={() => setApplyDialogOpen(false)} className="w-full">Cancel</Button>
                        <Button onClick={handleConfirmApply} disabled={applying} className="w-full bg-primary shadow-lg shadow-primary/20">
                            {applying ? "Submitting..." : "Confirm & Apply"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Job Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Post New Job Opportunity</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Job Title</label>
                                <Input
                                    placeholder="e.g. Senior Math Teacher"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Teacher Type</label>
                                <Select
                                    value={newJob.teacher_type}
                                    onValueChange={(val) => setNewJob({ ...newJob, teacher_type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="academic">Academic</SelectItem>
                                        <SelectItem value="music">Music</SelectItem>
                                        <SelectItem value="sports">Sports</SelectItem>
                                        <SelectItem value="language">Language</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Location / Mode</label>
                            <Input
                                placeholder="e.g. Mumbai (On-site) or Remote"
                                value={newJob.location}
                                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Description & Requirements</label>
                            <Textarea
                                placeholder="Detail the role, required experience, and any specific skills needed..."
                                className="min-h-[150px] resize-none"
                                value={newJob.description}
                                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateJob} disabled={creating} className="px-8 bg-primary">
                            {creating ? "Posting..." : "Post Opportunity"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* View Applications Dialog */}
            <Dialog open={viewAppsOpen} onOpenChange={setViewAppsOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Applications for {selectedJob?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 max-h-[60vh] overflow-y-auto">
                        {loadingApps ? (
                            <div className="text-center py-10">Loading applications...</div>
                        ) : jobApps.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">No applications yet.</div>
                        ) : (
                            <div className="space-y-4">
                                {jobApps.map((app) => (
                                    <Card key={app.id} className="p-4 border-muted/50">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                                    {app.profiles?.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{app.profiles?.full_name}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Briefcase className="h-3.5 w-3.5" />
                                                            {app.profiles?.teacher_type}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {app.profiles?.email}
                                                        </span>
                                                        {app.profiles?.phone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="h-3.5 w-3.5" />
                                                                {app.profiles?.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {app.status === 'pending' ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-success hover:text-success hover:bg-success/10 border-success/20"
                                                            onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                                            onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Badge className={
                                                        app.status === 'accepted' ? 'bg-success' : 'bg-destructive'
                                                    }>
                                                        {app.status.toUpperCase()}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewAppsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
