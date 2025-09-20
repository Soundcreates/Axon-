// // "use client";
// // import React, { useMemo, useRef, useState } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import {
// //   Badge,
// //   Button,
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardFooter,
// //   CardHeader,
// //   CardTitle,
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// //   Input,
// //   Label,
// //   Progress,
// //   Separator,
// //   Tabs,
// //   TabsContent,
// //   TabsList,
// //   TabsTrigger,
// //   Textarea,
// //   Tooltip,
// //   TooltipContent,
// //   TooltipProvider,
// //   TooltipTrigger,
// //   Avatar,
// //   AvatarFallback,
// //   AvatarImage,
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuLabel,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// //   Sheet,
// //   SheetTrigger,
// //   SheetContent
// // } from "@/components/ui";
// // import {
// //   FileUp,
// //   FileText,
// //   Sparkles,
// //   ShieldCheck,
// //   Timer,
// //   Coins,
// //   ChevronRight,
// //   Star,
// //   Copy,
// //   CheckCheck,
// //   Search,
// //   Filter,
// //   History,
// //   ExternalLink,
// //   Award,
// //   Upload,
// //   Eye,
// //   EyeOff,
// //   Github,
// //   Bell,
// //   LogOut,
// //   User,
// //   Inbox,
// //   ThumbsUp,
// //   AlertCircle
// // } from "lucide-react";


// // // -----------------------------
// // // Theme tokens (Tailwind uses CSS vars via globals.css)
// // // -----------------------------
// // const brand = {
// //   name: "Axon",
// //   gradient: "bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(56,189,248,.25),transparent_40%),radial-gradient(1000px_600px_at_90%_30%,rgba(99,102,241,.25),transparent_40%),radial-gradient(800px_500px_at_50%_100%,rgba(34,197,94,.18),transparent_40%)]",
// //   glass: "backdrop-blur-xl bg-white/5 border border-white/10",
// // };

// // // -----------------------------
// // // Minimal wallet + IPFS + contract stubs
// // // -----------------------------
// // async function connectWallet(): Promise<string | null> {
// //   const eth = (globalThis as any).ethereum;
// //   if (!eth) return null;
// //   const accounts = await eth.request({ method: "eth_requestAccounts" });
// //   return accounts?.[0] ?? null;
// // }

// // // Simulated IPFS upload returning a CID
// // async function uploadToIPFS(file: File, onProgress: (p: number) => void): Promise<string> {
// //   return new Promise((resolve) => {
// //     let p = 0;
// //     const iv = setInterval(() => {
// //       p += Math.random() * 18;
// //       if (p >= 100) {
// //         clearInterval(iv);
// //         onProgress(100);
// //         // Fake CID
// //         resolve("bafybeigdyrccid" + Math.random().toString(36).slice(2, 8));
// //       } else onProgress(Math.min(99, Math.floor(p)));
// //     }, 140);
// //   });
// // }

// // // Contract call placeholders
// // async function submitManuscript(cid: string, title: string, anon: boolean) {
// //   // TODO: replace with real contract call (ethers.js / viem)
// //   await new Promise((r) => setTimeout(r, 900));
// //   return { txHash: "0xmanu" + Math.random().toString(16).slice(2, 8), status: "confirmed" };
// // }

// // async function stakeForReview(manuscriptId: string, amount: number) {
// //   await new Promise((r) => setTimeout(r, 800));
// //   return { txHash: "0xstake" + Math.random().toString(16).slice(2, 8), status: "confirmed" };
// // }

// // async function submitReview(manuscriptId: string, cid: string, anon: boolean) {
// //   await new Promise((r) => setTimeout(r, 1000));
// //   return { txHash: "0xrev" + Math.random().toString(16).slice(2, 8), status: "confirmed" };
// // }

// // // -----------------------------
// // // Types
// // // -----------------------------
// // interface Manuscript {
// //   id: string;
// //   title: string;
// //   author: string;
// //   field: string;
// //   cid: string;
// //   bounty: number;
// //   deadlineDays: number;
// //   reputationReq: number;
// //   status: "PendingReview" | "InReview" | "Decision";
// // }

// // interface Review {
// //   id: string;
// //   manuscriptId: string;
// //   reviewer: string;
// //   quality: number; // 0-100
// //   cid: string;
// //   anonymous: boolean;
// // }

// // // -----------------------------
// // // Sample data (replace with API calls)
// // // -----------------------------
// // const SAMPLE_MANUSCRIPTS: Manuscript[] = [
// //   {
// //     id: "MSK-2025-001",
// //     title: "Sparse Attention Improves Ocean Eddy Forecasting",
// //     author: "0x8A3...91C2",
// //     field: "ML / Oceanography",
// //     cid: "bafybeigdyrci123",
// //     bounty: 420,
// //     deadlineDays: 10,
// //     reputationReq: 60,
// //     status: "PendingReview",
// //   },
// //   {
// //     id: "MSK-2025-002",
// //     title: "Catalyst‑Free Room Temp Ammonia Synthesis",
// //     author: "0x2c1...aa77",
// //     field: "Chemistry",
// //     cid: "bafybeigdyrci456",
// //     bounty: 300,
// //     deadlineDays: 7,
// //     reputationReq: 45,
// //     status: "PendingReview",
// //   },
// //   {
// //     id: "MSK-2025-003",
// //     title: "Axon: Token‑Aligned Transparent Peer Review",
// //     author: "0xA11...0N00",
// //     field: "DeSci / Systems",
// //     cid: "bafybeigdyrci789",
// //     bounty: 500,
// //     deadlineDays: 5,
// //     reputationReq: 50,
// //     status: "InReview",
// //   },
// // ];

// // // -----------------------------
// // // Utilities
// // // -----------------------------
// // function short(addr: string) {
// //   if (!addr) return "";
// //   return addr.slice(0, 6) + "…" + addr.slice(-4);
// // }

// // // -----------------------------
// // // Main Component
// // // -----------------------------
// // export default function AxonUI() {
// //   const [account, setAccount] = useState<string | null>(null);
// //   const [tab, setTab] = useState("explore");
// //   const [toast, setToast] = useState<null | { icon: React.ReactNode; text: string }>(null);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [uploadProgress, setUploadProgress] = useState(0);
// //   const [manuscripts, setManuscripts] = useState<Manuscript[]>(SAMPLE_MANUSCRIPTS);
// //   const [anonymize, setAnonymize] = useState(true);

// //   // Submit dialog state
// //   const [openSubmit, setOpenSubmit] = useState(false);
// //   const fileRef = useRef<HTMLInputElement | null>(null);
// //   const [draftTitle, setDraftTitle] = useState("");
// //   const [selectedFile, setSelectedFile] = useState<File | null>(null);

// //   const reputation = 68; // TODO: fetch on‑chain
// //   const pendingReviews = useMemo(() => manuscripts.filter(m => m.status !== "Decision"), [manuscripts]);

// //   // Handlers
// //   const doConnect = async () => {
// //     const a = await connectWallet();
// //     if (!a) {
// //       setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "MetaMask not detected. Install to continue." });
// //       return;
// //     }
// //     setAccount(a);
// //     setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Connected ${short(a)}` });
// //   };

// //   const doSubmitManuscript = async () => {
// //     if (!selectedFile || !draftTitle) return;
// //     try {
// //       setSubmitting(true);
// //       setUploadProgress(0);
// //       setToast({ icon: <Upload className="w-4 h-4" />, text: "Uploading to IPFS…" });
// //       const cid = await uploadToIPFS(selectedFile, setUploadProgress);
// //       setToast({ icon: <ShieldCheck className="w-4 h-4" />, text: "Calling submitManuscript()…" });
// //       const res = await submitManuscript(cid, draftTitle, anonymize);
// //       setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Manuscript on‑chain ✓ TX ${short(res.txHash)}` });
// //       setOpenSubmit(false);
// //       // Add to list
// //       setManuscripts(prev => [{
// //         id: "MSK-" + (Math.random() * 10000).toFixed(0),
// //         title: draftTitle,
// //         author: account ? short(account) : "you",
// //         field: "—",
// //         cid,
// //         bounty: 0,
// //         deadlineDays: 10,
// //         reputationReq: 0,
// //         status: "PendingReview"
// //       }, ...prev]);
// //       setDraftTitle("");
// //       setSelectedFile(null);
// //       if (fileRef.current) fileRef.current.value = "";
// //     } catch (e) {
// //       setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "Submit failed. Check console & network." });
// //       console.error(e);
// //     } finally {
// //       setSubmitting(false);
// //       setUploadProgress(0);
// //     }
// //   };

// //   const doStake = async (m: Manuscript) => {
// //     setToast({ icon: <Coins className="w-4 h-4" />, text: `Staking AXN for ${m.id}…` });
// //     await stakeForReview(m.id, 50);
// //     setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Stake locked ✓ You’re assigned to ${m.id}` });
// //   };

// //   // Review upload
// //   const [openReview, setOpenReview] = useState(false);
// //   const [reviewFor, setReviewFor] = useState<Manuscript | null>(null);
// //   const [reviewText, setReviewText] = useState("");
// //   const [reviewFile, setReviewFile] = useState<File | null>(null);
// //   const [reviewAnon, setReviewAnon] = useState(true);

// //   const startReview = (m: Manuscript) => { setReviewFor(m); setOpenReview(true); };

// //   const doSubmitReview = async () => {
// //     if (!reviewFor) return;
// //     try {
// //       setSubmitting(true);
// //       if (reviewFile) {
// //         setToast({ icon: <Upload className="w-4 h-4" />, text: "Uploading review to IPFS…" });
// //         const cid = await uploadToIPFS(reviewFile, setUploadProgress);
// //         setToast({ icon: <ShieldCheck className="w-4 h-4" />, text: "Calling submitReview()…" });
// //         const res = await submitReview(reviewFor.id, cid, reviewAnon);
// //         setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Review logged ✓ TX ${short(res.txHash)}` });
// //       } else {
// //         // Allow pure‑text review as fallback (store off‑chain & pin server‑side)
// //         setToast({ icon: <Upload className="w-4 h-4" />, text: "Pinning text review…" });
// //         await new Promise((r) => setTimeout(r, 500));
// //         const res = await submitReview(reviewFor.id, "bafybeigdtextrev", reviewAnon);
// //         setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Review logged ✓ TX ${short(res.txHash)}` });
// //       }
// //       setOpenReview(false);
// //       setReviewText("");
// //       setReviewFile(null);
// //       setReviewFor(null);
// //     } catch (e) {
// //       setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "Review submit failed." });
// //     } finally {
// //       setSubmitting(false);
// //       setUploadProgress(0);
// //     }
// //   };

// //   return (
// //     <div className={`min-h-screen text-white ${brand.gradient}`}>
// //       <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)]" />

// //       {/* Top Nav */}
// //       <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur bg-black/40">
// //         <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
// //           <div className="flex items-center gap-3">
// //             <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-400/80 to-indigo-500/80 grid place-items-center shadow-lg shadow-cyan-500/20">
// //               <Sparkles className="w-5 h-5" />
// //             </div>
// //             <div>
// //               <div className="text-lg font-extrabold tracking-tight">Axon</div>
// //               <div className="text-xs text-white/60 -mt-1">Token‑Aligned Peer Review</div>
// //             </div>
// //           </div>

// //           <div className="hidden md:flex items-center gap-6 text-white/80">
// //             <a className="hover:text-white" href="#explore">Explore</a>
// //             <a className="hover:text-white" href="#submit">Submit</a>
// //             <a className="hover:text-white" href="#reviews">Reviews</a>
// //             <a className="hover:text-white" href="#profile">Profile</a>
// //           </div>

// //           <div className="flex items-center gap-3">
// //             <TooltipProvider>
// //               <Tooltip>
// //                 <TooltipTrigger asChild>
// //                   <Button variant="ghost" size="icon" className="rounded-2xl">
// //                     <Bell className="w-5 h-5" />
// //                   </Button>
// //                 </TooltipTrigger>
// //                 <TooltipContent>Notifications</TooltipContent>
// //               </Tooltip>
// //             </TooltipProvider>

// //             {account ? (
// //               <DropdownMenu>
// //                 <DropdownMenuTrigger asChild>
// //                   <Button className="rounded-2xl" variant="secondary">
// //                     <User className="w-4 h-4 mr-2" /> {short(account)}
// //                   </Button>
// //                 </DropdownMenuTrigger>
// //                 <DropdownMenuContent align="end" className="w-56">
// //                   <DropdownMenuLabel>Account</DropdownMenuLabel>
// //                   <DropdownMenuSeparator />
// //                   <DropdownMenuItem onClick={() => navigator.clipboard.writeText(account)}>
// //                     <Copy className="w-4 h-4 mr-2" /> Copy address
// //                   </DropdownMenuItem>
// //                   <DropdownMenuItem>
// //                     <History className="w-4 h-4 mr-2" /> Activity
// //                   </DropdownMenuItem>
// //                   <DropdownMenuSeparator />
// //                   <DropdownMenuItem onClick={() => setAccount(null)}>
// //                     <LogOut className="w-4 h-4 mr-2" /> Disconnect
// //                   </DropdownMenuItem>
// //                 </DropdownMenuContent>
// //               </DropdownMenu>
// //             ) : (
// //               <Button className="rounded-2xl" onClick={doConnect}>Connect Wallet</Button>
// //             )}
// //           </div>
// //         </div>
// //       </header>

// //       {/* Hero / CTA */}
// //       <section className="max-w-7xl mx-auto px-4 pt-10 pb-4" id="explore">
// //         <div className="grid md:grid-cols-2 gap-8 items-center">
// //           <div>
// //             <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
// //               Transparent, Incentivized <span className="text-cyan-300">Peer Review</span> for Science
// //             </h1>
// //             <p className="mt-4 text-white/80 max-w-xl">
// //               Stake to review. Earn token rewards for on‑time, high‑quality feedback. Immutable, auditable history — all on‑chain.
// //             </p>
// //             <div className="mt-6 flex flex-wrap gap-3">
// //               <Button className="rounded-2xl" onClick={() => setOpenSubmit(true)}>
// //                 <FileUp className="w-4 h-4 mr-2" /> Submit Manuscript
// //               </Button>
// //               <Button className="rounded-2xl" variant="secondary" onClick={() => setTab("explore")}>Browse Calls</Button>
// //               <Button className="rounded-2xl" variant="ghost">
// //                 <Github className="w-4 h-4 mr-2" /> Docs
// //               </Button>
// //             </div>
// //             <div className="mt-6 flex items-center gap-4 text-sm">
// //               <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> On‑chain reputation</div>
// //               <div className="flex items-center gap-2"><Timer className="w-4 h-4" /> SLA‑backed deadlines</div>
// //               <div className="flex items-center gap-2"><Coins className="w-4 h-4" /> Token rewards</div>
// //             </div>
// //           </div>

// //           <motion.div
// //             initial={{ opacity: 0, y: 20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ duration: 0.6 }}
// //             className={`rounded-3xl p-1 ${brand.glass}`}
// //           >
// //             <div className="rounded-3xl p-6 bg-gradient-to-b from-white/5 to-transparent">
// //               <div className="text-xs uppercase tracking-widest text-white/60 mb-2">Live Opportunities</div>
// //               <div className="grid gap-3">
// //                 {pendingReviews.map((m) => (
// //                   <Card key={m.id} className="bg-white/5 border-white/10">
// //                     <CardHeader className="pb-2">
// //                       <CardTitle className="text-base flex items-center justify-between gap-3">
// //                         <span>{m.title}</span>
// //                         <Badge variant="secondary">{m.field}</Badge>
// //                       </CardTitle>
// //                       <CardDescription className="flex items-center gap-3 text-white/70">
// //                         <span>Author {m.author}</span>
// //                         <span className="opacity-50">•</span>
// //                         <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {m.deadlineDays} days</span>
// //                         <span className="opacity-50">•</span>
// //                         <span className="flex items-center gap-1"><Coins className="w-4 h-4" /> {m.bounty} AXN</span>
// //                       </CardDescription>
// //                     </CardHeader>
// //                     <CardFooter className="pt-0 flex items-center justify-between">
// //                       <div className="text-sm text-white/60">Req. Rep ≥ {m.reputationReq}</div>
// //                       <div className="flex gap-2">
// //                         <Button size="sm" variant="ghost">
// //                           <a className="flex items-center" href={`https://ipfs.io/ipfs/${m.cid}`} target="_blank" rel="noreferrer">
// //                             <FileText className="w-4 h-4 mr-2" /> View
// //                           </a>
// //                         </Button>
// //                         <Button size="sm" className="rounded-xl" onClick={() => doStake(m)}>
// //                           Accept & Stake
// //                         </Button>
// //                         <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => startReview(m)}>
// //                           Submit Review
// //                         </Button>
// //                       </div>
// //                     </CardFooter>
// //                   </Card>
// //                 ))}
// //               </div>
// //             </div>
// //           </motion.div>
// //         </div>
// //       </section>

// //       {/* Main Tabs */}
// //       <section className="max-w-7xl mx-auto px-4 pb-16" id="reviews">
// //         <Tabs value={tab} onValueChange={setTab} className="mt-6">
// //           <TabsList className="bg-white/10">
// //             <TabsTrigger value="explore">Explore</TabsTrigger>
// //             <TabsTrigger value="submit">Submit</TabsTrigger>
// //             <TabsTrigger value="myreviews">My Reviews</TabsTrigger>
// //             <TabsTrigger value="profile">Profile</TabsTrigger>
// //           </TabsList>

// //           {/* Explore */}
// //           <TabsContent value="explore" className="mt-6">
// //             <div className="flex items-center gap-3 mb-4">
// //               <div className="relative w-full md:w-96">
// //                 <Input placeholder="Search title / field / CID" className="pl-10 bg-white/5 border-white/10" />
// //                 <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
// //               </div>
// //               <Button variant="outline" className="bg-white/5 border-white/10">
// //                 <Filter className="w-4 h-4 mr-2" /> Filters
// //               </Button>
// //             </div>
// //             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
// //               {manuscripts.map((m) => (
// //                 <Card key={m.id} className="bg-white/5 border-white/10 hover:border-white/20 transition">
// //                   <CardHeader>
// //                     <div className="flex items-center justify-between">
// //                       <CardTitle className="text-lg leading-tight pr-2">{m.title}</CardTitle>
// //                       <Badge className="shrink-0">{m.field}</Badge>
// //                     </div>
// //                     <CardDescription className="text-white/70 flex items-center gap-2">
// //                       <span>Author {m.author}</span>
// //                       <span className="opacity-50">•</span>
// //                       <span>ID {m.id}</span>
// //                     </CardDescription>
// //                   </CardHeader>
// //                   <CardContent className="space-y-2">
// //                     <div className="flex items-center justify-between text-sm text-white/70">
// //                       <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {m.deadlineDays} days</span>
// //                       <span className="flex items-center gap-1"><Coins className="w-4 h-4" /> {m.bounty} AXN</span>
// //                     </div>
// //                     <div className="text-xs text-white/60">Req. reputation ≥ {m.reputationReq}</div>
// //                   </CardContent>
// //                   <CardFooter className="flex gap-2">
// //                     <Button size="sm" variant="ghost" className="rounded-xl">
// //                       <a className="flex items-center" href={`https://ipfs.io/ipfs/${m.cid}`} target="_blank" rel="noreferrer">
// //                         <ExternalLink className="w-4 h-4 mr-2" /> IPFS
// //                       </a>
// //                     </Button>
// //                     <Button size="sm" className="rounded-xl" onClick={() => doStake(m)}>Accept & Stake</Button>
// //                     <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => startReview(m)}>Submit Review</Button>
// //                   </CardFooter>
// //                 </Card>
// //               ))}
// //             </div>
// //           </TabsContent>

// //           {/* Submit */}
// //           <TabsContent value="submit" className="mt-6" id="submit">
// //             <Card className="bg-white/5 border-white/10">
// //               <CardHeader>
// //                 <CardTitle>Submit a Manuscript</CardTitle>
// //                 <CardDescription>Upload your PDF to IPFS, then confirm on‑chain.</CardDescription>
// //               </CardHeader>
// //               <CardContent className="space-y-4">
// //                 <div>
// //                   <Label htmlFor="title">Title</Label>
// //                   <Input id="title" placeholder="Enter manuscript title" className="bg-white/5 border-white/10 mt-1" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
// //                 </div>
// //                 <div>
// //                   <Label>File (PDF)</Label>
// //                   <Input ref={fileRef} type="file" accept="application/pdf" className="bg-white/5 border-white/10 mt-1" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
// //                 </div>
// //                 <div className="flex items-center gap-3 text-sm">
// //                   <Button type="button" variant="outline" className="bg-white/5 border-white/10 rounded-xl" onClick={() => setAnonymize(v => !v)}>
// //                     {anonymize ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {anonymize ? "Anonymized" : "Public"}
// //                   </Button>
// //                   <span className="text-white/60">Control visibility of your author identity in the review phase.</span>
// //                 </div>
// //                 <Button disabled={!draftTitle || !selectedFile || submitting} className="rounded-2xl" onClick={doSubmitManuscript}>
// //                   <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit to IPFS & Chain"}
// //                 </Button>
// //                 {submitting && (
// //                   <div className="space-y-2">
// //                     <div className="text-xs text-white/60">Upload progress</div>
// //                     <Progress value={uploadProgress} />
// //                   </div>
// //                 )}
// //               </CardContent>
// //             </Card>
// //           </TabsContent>

// //           {/* My Reviews */}
// //           <TabsContent value="myreviews" className="mt-6">
// //             <Card className="bg-white/5 border-white/10">
// //               <CardHeader>
// //                 <CardTitle>My Review Journey</CardTitle>
// //                 <CardDescription>Track stakes, deadlines, submissions, and rewards.</CardDescription>
// //               </CardHeader>
// //               <CardContent className="grid md:grid-cols-2 gap-4">
// //                 <div className="space-y-3">
// //                   <div className="text-sm text-white/70">Reviewer Reputation</div>
// //                   <div className="flex items-center gap-3">
// //                     <div className="text-4xl font-black">{reputation}</div>
// //                     <Badge variant="secondary" className="rounded-xl">On‑chain</Badge>
// //                   </div>
// //                   <Progress value={reputation} />
// //                   <div className="text-xs text-white/60">Higher rep unlocks higher bounties and priority matching.</div>
// //                 </div>
// //                 <div className="space-y-3">
// //                   <div className="text-sm text-white/70">Recent Rewards</div>
// //                   <div className="flex items-center gap-2 text-white/80"><Coins className="w-4 h-4" /> +220 AXN — MSK‑2025‑003</div>
// //                   <div className="flex items-center gap-2 text-white/80"><Coins className="w-4 h-4" /> +150 AXN — MSK‑2025‑001</div>
// //                   <div className="text-xs text-white/60">Slashing occurs for late or low‑quality reviews.</div>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           </TabsContent>

// //           {/* Profile */}
// //           <TabsContent value="profile" className="mt-6" id="profile">
// //             <Card className="bg-white/5 border-white/10">
// //               <CardHeader>
// //                 <CardTitle>Profile</CardTitle>
// //                 <CardDescription>Wallet‑linked off‑chain profile (Postgres) + on‑chain proofs.</CardDescription>
// //               </CardHeader>
// //               <CardContent className="grid md:grid-cols-2 gap-6">
// //                 <div className="space-y-3">
// //                   <Label>Display Name</Label>
// //                   <Input placeholder="Ada Lovelace" className="bg-white/5 border-white/10" />
// //                   <Label>Field(s) of Expertise</Label>
// //                   <Input placeholder="ML, Cryptography" className="bg-white/5 border-white/10" />
// //                   <Label>Affiliation (optional)</Label>
// //                   <Input placeholder="KJSCE" className="bg-white/5 border-white/10" />
// //                 </div>
// //                 <div className="space-y-3">
// //                   <Label>Bio</Label>
// //                   <Textarea rows={6} placeholder="Short reviewer/author bio" className="bg-white/5 border-white/10" />
// //                   <div className="text-xs text-white/60">Only non‑sensitive information is stored off‑chain.</div>
// //                 </div>
// //               </CardContent>
// //               <CardFooter>
// //                 <Button className="rounded-2xl">Save Profile</Button>
// //               </CardFooter>
// //             </Card>
// //           </TabsContent>
// //         </Tabs>
// //       </section>

// //       {/* Submit Modal (Quick access from Hero CTA) */}
// //       <Dialog open={openSubmit} onOpenChange={setOpenSubmit}>
// //         <DialogContent className="sm:max-w-lg bg-black/80 border-white/10 text-white">
// //           <DialogHeader>
// //             <DialogTitle>Submit Manuscript</DialogTitle>
// //             <DialogDescription className="text-white/60">Upload your PDF to IPFS and anchor the record on‑chain.</DialogDescription>
// //           </DialogHeader>
// //           <div className="space-y-3">
// //             <Label>Title</Label>
// //             <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="bg-white/5 border-white/10" />
// //             <Label>PDF File</Label>
// //             <Input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} className="bg-white/5 border-white/10" />
// //             <div className="flex items-center gap-3 text-sm">
// //               <Button type="button" variant="outline" className="bg-white/5 border-white/10 rounded-xl" onClick={() => setAnonymize(v => !v)}>
// //                 {anonymize ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {anonymize ? "Anonymized" : "Public"}
// //               </Button>
// //               <span className="text-white/60">Control author visibility during review.</span>
// //             </div>
// //             {submitting && <Progress value={uploadProgress} />}
// //           </div>
// //           <DialogFooter>
// //             <Button disabled={!draftTitle || !selectedFile || submitting} onClick={doSubmitManuscript} className="rounded-2xl">
// //               <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit"}
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Review Modal */}
// //       <Dialog open={openReview} onOpenChange={setOpenReview}>
// //         <DialogContent className="sm:max-w-2xl bg-black/80 border-white/10 text-white">
// //           <DialogHeader>
// //             <DialogTitle>Submit Review {reviewFor ? `for ${reviewFor.id}` : ""}</DialogTitle>
// //             <DialogDescription className="text-white/60">Attach a PDF or paste text. Your stake + deadline applies.</DialogDescription>
// //           </DialogHeader>
// //           <div className="grid md:grid-cols-2 gap-4">
// //             <div className="space-y-3">
// //               <Label>Attach PDF (optional)</Label>
// //               <Input type="file" accept="application/pdf" onChange={(e) => setReviewFile(e.target.files?.[0] ?? null)} className="bg-white/5 border-white/10" />
// //               <div className="flex items-center gap-3 text-sm">
// //                 <Button type="button" variant="outline" className="bg-white/5 border-white/10 rounded-xl" onClick={() => setReviewAnon(v => !v)}>
// //                   {reviewAnon ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {reviewAnon ? "Anonymous" : "Public"}
// //                 </Button>
// //                 <span className="text-white/60">Toggle reviewer anonymity.</span>
// //               </div>
// //             </div>
// //             <div className="space-y-3">
// //               <Label>Review (plain text)</Label>
// //               <Textarea rows={8} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Structured feedback: Summary • Strengths • Weaknesses • Reproducibility • Ethics • Score" className="bg-white/5 border-white/10" />
// //             </div>
// //           </div>
// //           {submitting && <Progress value={uploadProgress} />}
// //           <DialogFooter>
// //             <Button disabled={submitting || (!reviewFile && !reviewText)} onClick={doSubmitReview} className="rounded-2xl">
// //               <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit Review"}
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Toast / Status Strip */}
// //       <AnimatePresence>
// //         {toast && (
// //           <motion.div
// //             initial={{ y: 40, opacity: 0 }}
// //             animate={{ y: 0, opacity: 1 }}
// //             exit={{ y: 40, opacity: 0 }}
// //             transition={{ type: "spring", stiffness: 260, damping: 22 }}
// //             className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]"
// //           >
// //             <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl shadow-lg ${brand.glass}`}>
// //               <div>{toast.icon}</div>
// //               <div className="text-sm">{toast.text}</div>
// //               <Button variant="ghost" size="icon" className="rounded-xl ml-2" onClick={() => setToast(null)}>
// //                 <CheckCheck className="w-4 h-4" />
// //               </Button>
// //             </div>
// //           </motion.div>
// //         )}
// //       </AnimatePresence>

// //       {/* Footer */}
// //       <footer className="border-t border-white/10 mt-10 bg-black/30">
// //         <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm text-white/70">
// //           <div>
// //             <div className="font-bold text-white">Axon</div>
// //             <div>Decentralized, auditable science validation.</div>
// //           </div>
// //           <div>
// //             <div className="font-semibold text-white mb-2">Principles</div>
// //             <ul className="space-y-1 list-disc list-inside">
// //               <li>Transparency by default</li>
// //               <li>Aligned token incentives</li>
// //               <li>Reputation as a public good</li>
// //             </ul>
// //           </div>
// //           <div>
// //             <div className="font-semibold text-white mb-2">Links</div>
// //             <ul className="space-y-1">
// //               <li><a className="hover:text-white" href="#">Whitepaper</a></li>
// //               <li><a className="hover:text-white" href="#">GitHub</a></li>
// //               <li><a className="hover:text-white" href="#">Security & Audits</a></li>
// //             </ul>
// //           </div>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // }
// "use client";

// import React, { useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { cubicBezier } from "framer-motion";

// import {
//   Badge,
//   Button,
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   Input,
//   Label,
//   Progress,
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
//   Textarea,
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui";
// import {
//   FileUp,
//   FileText,
//   Sparkles,
//   ShieldCheck,
//   Timer,
//   Coins,
//   Github,
//   Bell,
//   LogOut,
//   User,
//   History,
//   ExternalLink,
//   Filter,
//   Search,
//   Eye,
//   EyeOff,
//   Copy,
//   CheckCheck,
//   AlertCircle,
// } from "lucide-react";

// /**
//  * AXON — Tokenized, Transparent Peer Review UI (Enhanced Edition)
//  * -------------------------------------------------------------
//  * ✨ Polished motion system
//  * 🎨 Award-style gradient theme (electric violet + cyan + magenta)
//  * 🧊 Glass surfaces + subtle matted textures
//  * 🫧 Floating particles + parallax hero aura
//  */

// // -----------------------------
// // Theme tokens
// // -----------------------------
// const brand = {
//   name: "Axon",
//   // Animated multi-stop gradient (GPU-friendly)
//   gradientBox:
//     "bg-[radial-gradient(1200px_600px_at_5%_5%,rgba(56,189,248,.25),transparent_40%),radial-gradient(900px_500px_at_95%_20%,rgba(168,85,247,.25),transparent_42%),radial-gradient(800px_600px_at_50%_98%,rgba(236,72,153,.18),transparent_44%)]",
//   glass: "backdrop-blur-xl bg-white/6 border border-white/10",
//   card: "bg-white/6 border-white/10",
// };

// // Motion presets
// const fadeUp = {
//   hidden: { opacity: 0, y: 18 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: cubicBezier(0.16, 1, 0.3, 1) } },
// };
// const stagger = { show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
// const hoverLift = { whileHover: { y: -3, scale: 1.01 }, transition: { type: "spring", stiffness: 300, damping: 18 } };

// // -----------------------------
// // Minimal wallet + IPFS + contract stubs (UI-only)
// // -----------------------------
// async function connectWallet(): Promise<string | null> {
//   const eth = (globalThis as any).ethereum;
//   if (!eth) return null;
//   const accounts = await eth.request({ method: "eth_requestAccounts" });
//   return accounts?.[0] ?? null;
// }

// async function uploadToIPFS(file: File, onProgress: (p: number) => void): Promise<string> {
//   return new Promise((resolve) => {
//     let p = 0;
//     const iv = setInterval(() => {
//       p += Math.random() * 18;
//       if (p >= 100) {
//         clearInterval(iv);
//         onProgress(100);
//         resolve("bafybeigdyrccid" + Math.random().toString(36).slice(2, 8));
//       } else onProgress(Math.min(99, Math.floor(p)));
//     }, 120);
//   });
// }

// async function submitManuscript(cid: string, title: string, anon: boolean) {
//   await new Promise((r) => setTimeout(r, 700));
//   return { txHash: "0xmanu" + Math.random().toString(16).slice(2, 8), status: "confirmed" } as const;
// }
// async function stakeForReview(manuscriptId: string, amount: number) {
//   await new Promise((r) => setTimeout(r, 600));
//   return { txHash: "0xstake" + Math.random().toString(16).slice(2, 8), status: "confirmed" } as const;
// }
// async function submitReview(manuscriptId: string, cid: string, anon: boolean) {
//   await new Promise((r) => setTimeout(r, 800));
//   return { txHash: "0xrev" + Math.random().toString(16).slice(2, 8), status: "confirmed" } as const;
// }

// // -----------------------------
// // Types
// // -----------------------------
// interface Manuscript {
//   id: string;
//   title: string;
//   author: string;
//   field: string;
//   cid: string;
//   bounty: number;
//   deadlineDays: number;
//   reputationReq: number;
//   status: "PendingReview" | "InReview" | "Decision";
// }

// // Demo data
// const SAMPLE_MANUSCRIPTS: Manuscript[] = [
//   { id: "MSK-2025-001", title: "Sparse Attention Improves Ocean Eddy Forecasting", author: "0x8A3…91C2", field: "ML / Oceanography", cid: "bafybeigdyrci123", bounty: 420, deadlineDays: 10, reputationReq: 60, status: "PendingReview" },
//   { id: "MSK-2025-002", title: "Catalyst‑Free Room Temp Ammonia Synthesis", author: "0x2c1…aa77", field: "Chemistry", cid: "bafybeigdyrci456", bounty: 300, deadlineDays: 7, reputationReq: 45, status: "PendingReview" },
//   { id: "MSK-2025-003", title: "Axon: Token‑Aligned Transparent Peer Review", author: "0xA11…0N00", field: "DeSci / Systems", cid: "bafybeigdyrci789", bounty: 500, deadlineDays: 5, reputationReq: 50, status: "InReview" },
// ];

// function short(addr: string) { return addr ? addr.slice(0, 6) + "…" + addr.slice(-4) : ""; }

// export default function AxonUI() {
//   const [account, setAccount] = useState<string | null>(null);
//   const [tab, setTab] = useState("explore");
//   const [toast, setToast] = useState<null | { icon: React.ReactNode; text: string }>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [manuscripts, setManuscripts] = useState<Manuscript[]>(SAMPLE_MANUSCRIPTS);
//   const [anonymize, setAnonymize] = useState(true);

//   const [openSubmit, setOpenSubmit] = useState(false);
//   const fileRef = useRef<HTMLInputElement | null>(null);
//   const [draftTitle, setDraftTitle] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   const reputation = 72; // mocked rep

//   // Review modal state
//   const [openReview, setOpenReview] = useState(false);
//   const [reviewFor, setReviewFor] = useState<Manuscript | null>(null);
//   const [reviewText, setReviewText] = useState("");
//   const [reviewFile, setReviewFile] = useState<File | null>(null);
//   const [reviewAnon, setReviewAnon] = useState(true);

//   const doConnect = async () => {
//     const a = await connectWallet();
//     if (!a) return setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "MetaMask not detected" });
//     setAccount(a);
//     setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Connected ${short(a)}` });
//   };

//   const doSubmitManuscript = async () => {
//     if (!selectedFile || !draftTitle) return;
//     try {
//       setSubmitting(true);
//       setUploadProgress(0);
//       setToast({ icon: <FileUp className="w-4 h-4" />, text: "Uploading to IPFS…" });
//       const cid = await uploadToIPFS(selectedFile, setUploadProgress);
//       setToast({ icon: <ShieldCheck className="w-4 h-4" />, text: "Anchoring on‑chain…" });
//       const res = await submitManuscript(cid, draftTitle, anonymize);
//       setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Submitted ✓ ${short(res.txHash)}` });
//       setOpenSubmit(false);
//       setManuscripts(prev => [{ id: "MSK-" + (Math.random() * 10000).toFixed(0), title: draftTitle, author: account ? short(account) : "you", field: "—", cid, bounty: 0, deadlineDays: 10, reputationReq: 0, status: "PendingReview" }, ...prev]);
//       setDraftTitle(""); setSelectedFile(null); if (fileRef.current) fileRef.current.value = "";
//     } catch (e) { setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "Submit failed" }); }
//     finally { setSubmitting(false); setUploadProgress(0); }
//   };

//   const doStake = async (m: Manuscript) => {
//     setToast({ icon: <Coins className="w-4 h-4" />, text: `Staking for ${m.id}…` });
//     await stakeForReview(m.id, 50);
//     setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Stake locked ✓` });
//   };

//   const startReview = (m: Manuscript) => { setReviewFor(m); setOpenReview(true); };

//   const doSubmitReview = async () => {
//     if (!reviewFor) return;
//     try {
//       setSubmitting(true);
//       if (reviewFile) {
//         setToast({ icon: <FileUp className="w-4 h-4" />, text: "Uploading review…" });
//         const cid = await uploadToIPFS(reviewFile, setUploadProgress);
//         const res = await submitReview(reviewFor.id, cid, reviewAnon);
//         setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Review logged ✓ ${short(res.txHash)}` });
//       } else {
//         await new Promise(r => setTimeout(r, 400));
//         const res = await submitReview(reviewFor.id, "bafybeigdtextrev", reviewAnon);
//         setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Review logged ✓ ${short(res.txHash)}` });
//       }
//       setOpenReview(false); setReviewText(""); setReviewFile(null); setReviewFor(null);
//     } catch (e) { setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "Review submit failed" }); }
//     finally { setSubmitting(false); setUploadProgress(0); }
//   };

//   return (
//     <div className={`min-h-screen text-white relative overflow-hidden ${brand.gradientBox}`}>
//       {/* Animated background auras + particles */}
//       <style>{`
//         @keyframes floaty { 0%{transform:translateY(0)} 50%{transform:translateY(-8px)} 100%{transform:translateY(0)} }
//         @keyframes hue { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
//         .glow-ring{ box-shadow:0 0 0 1px rgba(255,255,255,.08),0 10px 40px rgba(168,85,247,.25),inset 0 0 60px rgba(56,189,248,.12)}
//       `}</style>
//       <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)]" />
//       {/* Particles */}
//       <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
//         {Array.from({ length: 18 }).map((_, i) => (
//           <motion.div key={i} className="absolute h-1 w-1 rounded-full bg-white/40" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }} initial={{ opacity: 0 }} animate={{ opacity: [0, .6, 0] }} transition={{ duration: 6 + Math.random()*6, repeat: Infinity, delay: i*.3 }} />
//         ))}
//       </div>

//       {/* Top Nav */}
//       <motion.header initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .6, ease: cubicBezier(0.16,1,0.3,1) }} className="sticky top-0 z-50 border-b border-white/10 backdrop-blur bg-black/40">
//         <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <motion.div animate={{ rotate: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="h-9 w-9 rounded-2xl glow-ring grid place-items-center bg-gradient-to-br from-cyan-400/80 to-fuchsia-500/80">
//               <Sparkles className="w-5 h-5" />
//             </motion.div>
//             <div>
//               <div className="text-lg font-extrabold tracking-tight">Axon</div>
//               <div className="text-xs text-white/60 -mt-1">Token‑Aligned Peer Review</div>
//             </div>
//           </div>

//           <nav className="hidden md:flex items-center gap-6 text-white/80">
//             <a className="hover:text-white transition-colors" href="#explore">Explore</a>
//             <a className="hover:text-white transition-colors" href="#submit">Submit</a>
//             <a className="hover:text-white transition-colors" href="#reviews">Reviews</a>
//             <a className="hover:text-white transition-colors" href="#profile">Profile</a>
//           </nav>

//           <div className="flex items-center gap-3">
//             <Button variant="ghost" size="icon" className="rounded-2xl">
//               <Bell className="w-5 h-5" />
//             </Button>

//             {account ? (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button className="rounded-2xl" variant="secondary">
//                     <User className="w-4 h-4 mr-2" /> {short(account)}
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <DropdownMenuLabel>Account</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => account && navigator.clipboard.writeText(account)}>
//                     <Copy className="w-4 h-4 mr-2" /> Copy address
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <History className="w-4 h-4 mr-2" /> Activity
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => setAccount(null)}>
//                     <LogOut className="w-4 h-4 mr-2" /> Disconnect
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               <Button className="rounded-2xl" onClick={doConnect}>Connect Wallet</Button>
//             )}
//           </div>
//         </div>
//       </motion.header>

//       {/* Hero */}
//       <section className="max-w-7xl mx-auto px-4 pt-10 pb-6" id="explore">
//         <motion.div variants={stagger} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-8 items-center">
//           <motion.div variants={fadeUp}>
//             <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
//               Transparent, Incentivized <span className="text-cyan-300">Peer Review</span> for Science
//             </h1>
//             <p className="mt-4 text-white/80 max-w-xl">
//               Stake to review. Earn token rewards for on‑time, high‑quality feedback. Immutable, auditable history — all on‑chain.
//             </p>
//             <div className="mt-6 flex flex-wrap gap-3">
//               <Button className="rounded-2xl" onClick={() => setOpenSubmit(true)}>
//                 <FileUp className="w-4 h-4 mr-2" /> Submit Manuscript
//               </Button>
//               <Button className="rounded-2xl" variant="secondary" onClick={() => setTab("explore")}>Browse Calls</Button>
//               <Button className="rounded-2xl" variant="ghost">
//                 <Github className="w-4 h-4 mr-2" /> Docs
//               </Button>
//             </div>
//             <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
//               {[
//                 { icon: <ShieldCheck className="w-4 h-4" />, text: "On‑chain reputation" },
//                 { icon: <Timer className="w-4 h-4" />, text: "SLA‑backed deadlines" },
//                 { icon: <Coins className="w-4 h-4" />, text: "Token rewards" },
//               ].map((f, i) => (
//                 <motion.div key={i} variants={fadeUp} className={`rounded-xl ${brand.glass} px-3 py-2 flex items-center gap-2`}>
//                   {f.icon}<span>{f.text}</span>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>

//           <motion.div variants={fadeUp} className={`rounded-3xl p-1 ${brand.glass} glow-ring`}>
//             <div className="rounded-3xl p-6 bg-gradient-to-b from-white/5 to-transparent">
//               <div className="text-xs uppercase tracking-widest text-white/60 mb-2">Live Opportunities</div>
//               <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3">
//                 {manuscripts.map((m, idx) => (
//                   <motion.div key={m.id} variants={fadeUp} {...hoverLift}>
//                     <Card className={`${brand.card} transition`}> 
//                       <CardHeader className="pb-2">
//                         <CardTitle className="text-base flex items-center justify-between gap-3">
//                           <span>{m.title}</span>
//                           <Badge variant="secondary">{m.field}</Badge>
//                         </CardTitle>
//                         <CardDescription className="flex flex-wrap items-center gap-3 text-white/70">
//                           <span>Author {m.author}</span>
//                           <span className="opacity-50">•</span>
//                           <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {m.deadlineDays} days</span>
//                           <span className="opacity-50">•</span>
//                           <span className="flex items-center gap-1"><Coins className="w-4 h-4" /> {m.bounty} AXN</span>
//                         </CardDescription>
//                       </CardHeader>
//                       <CardFooter className="pt-0 flex items-center justify-between">
//                         <div className="text-sm text-white/60">Req. Rep ≥ {m.reputationReq}</div>
//                         <div className="flex gap-2">
//                           <Button size="sm" variant="ghost">
//                             <a className="flex items-center" href={`https://ipfs.io/ipfs/${m.cid}`} target="_blank" rel="noreferrer">
//                               <FileText className="w-4 h-4 mr-2" /> View
//                             </a>
//                           </Button>
//                           <Button size="sm" className="rounded-xl" onClick={() => doStake(m)}>Accept & Stake</Button>
//                         </div>
//                       </CardFooter>
//                     </Card>
//                   </motion.div>
//                 ))}
//               </motion.div>
//             </div>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* Tabs Section */}
//       <section className="max-w-7xl mx-auto px-4 pb-16" id="reviews">
//         <Tabs value={tab} onValueChange={setTab} className="mt-6">
//           <TabsList className="bg-white/10">
//             <TabsTrigger value="explore">Explore</TabsTrigger>
//             <TabsTrigger value="submit">Submit</TabsTrigger>
//             <TabsTrigger value="myreviews">My Reviews</TabsTrigger>
//             <TabsTrigger value="profile">Profile</TabsTrigger>
//           </TabsList>

//           {/* Explore */}
//           <TabsContent value="explore" className="mt-6 space-y-4">
//             <div className="flex items-center gap-3">
//               <div className="relative w-full md:w-96">
//                 <Input placeholder="Search title / field / CID" className="pl-10 bg-white/5 border-white/10" />
//                 <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
//               </div>
//               <Button variant="outline" className="bg-white/5 border-white/10">
//                 <Filter className="w-4 h-4 mr-2" /> Filters
//               </Button>
//             </div>
//             <motion.div variants={stagger} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {manuscripts.map((m) => (
//                 <motion.div key={m.id} variants={fadeUp} {...hoverLift}>
//                   <Card className={`${brand.card} hover:border-white/20 transition`}> 
//                     <CardHeader>
//                       <div className="flex items-center justify-between">
//                         <CardTitle className="text-lg leading-tight pr-2">{m.title}</CardTitle>
//                         <Badge className="shrink-0">{m.field}</Badge>
//                       </div>
//                       <CardDescription className="text-white/70 flex items-center gap-2">
//                         <span>Author {m.author}</span>
//                         <span className="opacity-50">•</span>
//                         <span>ID {m.id}</span>
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2">
//                       <div className="flex items-center justify-between text-sm text-white/70">
//                         <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {m.deadlineDays} days</span>
//                         <span className="flex items-center gap-1"><Coins className="w-4 h-4" /> {m.bounty} AXN</span>
//                       </div>
//                       <div className="text-xs text-white/60">Req. reputation ≥ {m.reputationReq}</div>
//                     </CardContent>
//                     <CardFooter className="flex gap-2">
//                       <Button size="sm" variant="ghost" className="rounded-xl">
//                         <a className="flex items-center" href={`https://ipfs.io/ipfs/${m.cid}`} target="_blank" rel="noreferrer">
//                           <ExternalLink className="w-4 h-4 mr-2" /> IPFS
//                         </a>
//                       </Button>
//                       <Button size="sm" className="rounded-xl" onClick={() => doStake(m)}>Accept & Stake</Button>
//                     </CardFooter>
//                   </Card>
//                 </motion.div>
//               ))}
//             </motion.div>
//           </TabsContent>

//           {/* Submit */}
//           <TabsContent value="submit" className="mt-6" id="submit">
//             <motion.div variants={fadeUp} initial="hidden" animate="show">
//               <Card className={`${brand.card}`}>
//                 <CardHeader>
//                   <CardTitle>Submit a Manuscript</CardTitle>
//                   <CardDescription>Upload your PDF to IPFS, then confirm on‑chain.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <Label htmlFor="title">Title</Label>
//                     <Input id="title" placeholder="Enter manuscript title" className="bg-white/5 border-white/10 mt-1" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
//                   </div>
//                   <div>
//                     <Label>File (PDF)</Label>
//                     <Input ref={fileRef} type="file" accept="application/pdf" className="bg-white/5 border-white/10 mt-1" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
//                   </div>
//                   <div className="flex items-center gap-3 text-sm">
//                     <Button type="button" variant="outline" className="bg-white/5 border-white/10 rounded-xl" onClick={() => setAnonymize(v => !v)}>
//                       {anonymize ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {anonymize ? "Anonymized" : "Public"}
//                     </Button>
//                     <span className="text-white/60">Control visibility of your author identity in the review phase.</span>
//                   </div>
//                   <Button disabled={!draftTitle || !selectedFile || submitting} className="rounded-2xl" onClick={doSubmitManuscript}>
//                     <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit to IPFS & Chain"}
//                   </Button>
//                   {submitting && (
//                     <div className="space-y-2">
//                       <div className="text-xs text-white/60">Upload progress</div>
//                       <Progress value={uploadProgress} />
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </TabsContent>

//           {/* My Reviews */}
//           <TabsContent value="myreviews" className="mt-6">
//             <motion.div variants={fadeUp} initial="hidden" animate="show">
//               <Card className={`${brand.card}`}>
//                 <CardHeader>
//                   <CardTitle>My Review Journey</CardTitle>
//                   <CardDescription>Track stakes, deadlines, submissions, and rewards.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-3">
//                     <div className="text-sm text-white/70">Reviewer Reputation</div>
//                     <div className="flex items-center gap-3">
//                       <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-4xl font-black">{reputation}</motion.div>
//                       <Badge variant="secondary" className="rounded-xl">On‑chain</Badge>
//                     </div>
//                     <Progress value={reputation} />
//                     <div className="text-xs text-white/60">Higher rep unlocks higher bounties and priority matching.</div>
//                   </div>
//                   <div className="space-y-3">
//                     <div className="text-sm text-white/70">Recent Rewards</div>
//                     <div className="flex items-center gap-2 text-white/80"><Coins className="w-4 h-4" /> +220 AXN — MSK‑2025‑003</div>
//                     <div className="flex items-center gap-2 text-white/80"><Coins className="w-4 h-4" /> +150 AXN — MSK‑2025‑001</div>
//                     <div className="text-xs text-white/60">Slashing occurs for late or low‑quality reviews.</div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </TabsContent>

//           {/* Profile */}
//           <TabsContent value="profile" className="mt-6" id="profile">
//             <motion.div variants={fadeUp} initial="hidden" animate="show">
//               <Card className={`${brand.card}`}>
//                 <CardHeader>
//                   <CardTitle>Profile</CardTitle>
//                   <CardDescription>Wallet‑linked off‑chain profile (Postgres) + on‑chain proofs.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="grid md:grid-cols-2 gap-6">
//                   <div className="space-y-3">
//                     <Label>Display Name</Label>
//                     <Input placeholder="Ada Lovelace" className="bg-white/5 border-white/10" />
//                     <Label>Field(s) of Expertise</Label>
//                     <Input placeholder="ML, Cryptography" className="bg-white/5 border-white/10" />
//                     <Label>Affiliation (optional)</Label>
//                     <Input placeholder="KJSCE" className="bg-white/5 border-white/10" />
//                   </div>
//                   <div className="space-y-3">
//                     <Label>Bio</Label>
//                     <Textarea rows={6} placeholder="Short reviewer/author bio" className="bg-white/5 border-white/10" />
//                     <div className="text-xs text-white/60">Only non‑sensitive information is stored off‑chain.</div>
//                   </div>
//                 </CardContent>
//                 <CardFooter>
//                   <Button className="rounded-2xl">Save Profile</Button>
//                 </CardFooter>
//               </Card>
//             </motion.div>
//           </TabsContent>
//         </Tabs>
//       </section>

//       {/* Submit Dialog */}
//       <Dialog open={openSubmit} onOpenChange={setOpenSubmit}>
//         <DialogContent className="sm:max-w-lg bg-black/80 border-white/10 text-white">
//           <DialogHeader>
//             <DialogTitle>Submit Manuscript</DialogTitle>
//             <DialogDescription className="text-white/60">Upload your PDF to IPFS and anchor the record on‑chain.</DialogDescription>
//           </DialogHeader>
//           <div className="space-y-3">
//             <Label>Title</Label>
//             <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="bg-white/5 border-white/10" />
//             <Label>PDF File</Label>
//             <Input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} className="bg-white/5 border-white/10" />
//             <div className="flex items-center gap-3 text-sm">
//               <Button type="button" variant="outline" className="bg-white/5 border-white/10 rounded-xl" onClick={() => setAnonymize(v => !v)}>
//                 {anonymize ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {anonymize ? "Anonymized" : "Public"}
//               </Button>
//               <span className="text-white/60">Control author visibility during review.</span>
//             </div>
//             {submitting && <Progress value={uploadProgress} />}
//           </div>
//           <DialogFooter>
//             <Button disabled={!draftTitle || !selectedFile || submitting} onClick={doSubmitManuscript} className="rounded-2xl">
//               <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Review Dialog */}
//       <Dialog open={openReview} onOpenChange={setOpenReview}>
//         <DialogContent className="sm:max-w-2xl bg-black/80 border-white/10 text-white">
//           <DialogHeader>
//             <DialogTitle>Submit Review {reviewFor ? `for ${reviewFor.id}` : ""}</DialogTitle>
//             <DialogDescription className="text-white/60">Attach a PDF or paste text. Your stake + deadline applies.</DialogDescription>
//           </DialogHeader>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div className="space-y-3">
//               <Label>Attach PDF (optional)</Label>
//               <Input type="file" accept="application/pdf" onChange={(e) => setReviewFile(e.target.files?.[0] ?? null)} className="bg-white/5 border-white/10" />
//               <div className="flex items-center gap-3 text-sm">
//                 <Button type="button" variant="outline" className="bg-white/5 border-white/10 rounded-xl" onClick={() => setReviewAnon(v => !v)}>
//                   {reviewAnon ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {reviewAnon ? "Anonymous" : "Public"}
//                 </Button>
//                 <span className="text-white/60">Toggle reviewer anonymity.</span>
//               </div>
//             </div>
//             <div className="space-y-3">
//               <Label>Review (plain text)</Label>
//               <Textarea rows={8} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Structured feedback: Summary • Strengths • Weaknesses • Reproducibility • Ethics • Score" className="bg-white/5 border-white/10" />
//             </div>
//           </div>
//           {submitting && <Progress value={uploadProgress} />}
//           <DialogFooter>
//             <Button disabled={submitting || (!reviewFile && !reviewText)} onClick={doSubmitReview} className="rounded-2xl">
//               <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit Review"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]">
//             <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl shadow-lg ${brand.glass}`}>
//               <div>{toast.icon}</div>
//               <div className="text-sm">{toast.text}</div>
//               <Button variant="ghost" size="icon" className="rounded-xl ml-2" onClick={() => setToast(null)}>
//                 <CheckCheck className="w-4 h-4" />
//               </Button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Footer */}
//       <footer className="border-t border-white/10 mt-10 bg-black/30">
//         <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm text-white/70">
//           <div>
//             <div className="font-bold text-white">Axon</div>
//             <div>Decentralized, auditable science validation.</div>
//           </div>
//           <div>
//             <div className="font-semibold text-white mb-2">Principles</div>
//             <ul className="space-y-1 list-disc list-inside">
//               <li>Transparency by default</li>
//               <li>Aligned token incentives</li>
//               <li>Reputation as a public good</li>
//             </ul>
//           </div>
//           <div>
//             <div className="font-semibold text-white mb-2">Links</div>
//             <ul className="space-y-1">
//               <li><a className="hover:text-white" href="#">Whitepaper</a></li>
//               <li><a className="hover:text-white" href="#">GitHub</a></li>
//               <li><a className="hover:text-white" href="#">Security & Audits</a></li>
//             </ul>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, cubicBezier, type Variants } from "framer-motion";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  FileUp,
  FileText,
  Sparkles,
  ShieldCheck,
  Timer,
  Coins,
  Github,
  Bell,
  LogOut,
  User,
  History,
  ExternalLink,
  Filter,
  Search,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
  AlertCircle,
} from "lucide-react";

// ========= Motion presets (v11-safe) =========
const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);
const easeOutQuint = cubicBezier(0.22, 1, 0.36, 1);

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

// put transition *inside* gesture for v11
const hoverLift = {
  whileHover: { y: -3, scale: 1.01, transition: { duration: 0.22, ease: easeOutQuint } },
} as const;

// ========= Minimal mocks so UI runs standalone =========
async function connectWallet(): Promise<string | null> {
  const eth = (globalThis as any).ethereum;
  if (!eth) return null;
  const accounts = await eth.request({ method: "eth_requestAccounts" });
  return accounts?.[0] ?? null;
}

async function uploadToIPFS(file: File, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve) => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) {
        clearInterval(iv);
        onProgress(100);
        resolve("bafybeigdyrccid" + Math.random().toString(36).slice(2, 8));
      } else onProgress(Math.min(99, Math.floor(p)));
    }, 120);
  });
}

async function submitManuscript(cid: string, title: string, anon: boolean) {
  await new Promise((r) => setTimeout(r, 700));
  return { txHash: "0xmanu" + Math.random().toString(16).slice(2, 8), status: "confirmed" } as const;
}
async function stakeForReview(manuscriptId: string, amount: number) {
  await new Promise((r) => setTimeout(r, 600));
  return { txHash: "0xstake" + Math.random().toString(16).slice(2, 8), status: "confirmed" } as const;
}
async function submitReview(manuscriptId: string, cid: string, anon: boolean) {
  await new Promise((r) => setTimeout(r, 800));
  return { txHash: "0xrev" + Math.random().toString(16).slice(2, 8), status: "confirmed" } as const;
}

// ========= Types & demo data =========
interface Manuscript {
  id: string;
  title: string;
  author: string;
  field: string;
  cid: string;
  bounty: number;
  deadlineDays: number;
  reputationReq: number;
  status: "PendingReview" | "InReview" | "Decision";
}

const SAMPLE_MANUSCRIPTS: Manuscript[] = [
  { id: "MSK-2025-001", title: "Sparse Attention Improves Ocean Eddy Forecasting", author: "0x8A3…91C2", field: "ML / Oceanography", cid: "bafybeigdyrci123", bounty: 420, deadlineDays: 10, reputationReq: 60, status: "PendingReview" },
  { id: "MSK-2025-002", title: "Catalyst-Free Room Temp Ammonia Synthesis", author: "0x2c1…aa77", field: "Chemistry", cid: "bafybeigdyrci456", bounty: 300, deadlineDays: 7, reputationReq: 45, status: "PendingReview" },
  { id: "MSK-2025-003", title: "Axon: Token-Aligned Transparent Peer Review", author: "0xA11…0N00", field: "DeSci / Systems", cid: "bafybeigdyrci789", bounty: 500, deadlineDays: 5, reputationReq: 50, status: "InReview" },
];

function short(addr: string) {
  return addr ? addr.slice(0, 6) + "…" + addr.slice(-4) : "";
}

// ========= Page =========
export default function AxonUI() {
  const [account, setAccount] = useState<string | null>(null);
  const [tab, setTab] = useState("explore");
  const [toast, setToast] = useState<null | { icon: React.ReactNode; text: string }>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>(SAMPLE_MANUSCRIPTS);
  const [anonymize, setAnonymize] = useState(true);

  const [openSubmit, setOpenSubmit] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const reputation = 72;

  const [openReview, setOpenReview] = useState(false);
  const [reviewFor, setReviewFor] = useState<Manuscript | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [reviewAnon, setReviewAnon] = useState(true);

  const doConnect = async () => {
    const a = await connectWallet();
    if (!a) return setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "MetaMask not detected" });
    setAccount(a);
    setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Connected ${short(a)}` });
  };

  const doSubmitManuscript = async () => {
    if (!selectedFile || !draftTitle) return;
    try {
      setSubmitting(true);
      setUploadProgress(0);
      setToast({ icon: <FileUp className="w-4 h-4" />, text: "Uploading to IPFS…" });
      const cid = await uploadToIPFS(selectedFile, setUploadProgress);
      setToast({ icon: <ShieldCheck className="w-4 h-4" />, text: "Anchoring on-chain…" });
      const res = await submitManuscript(cid, draftTitle, anonymize);
      setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Submitted ✓ ${short(res.txHash)}` });
      setOpenSubmit(false);
      setManuscripts((prev) => [
        { id: "MSK-" + (Math.random() * 10000).toFixed(0), title: draftTitle, author: account ? short(account) : "you", field: "—", cid, bounty: 0, deadlineDays: 10, reputationReq: 0, status: "PendingReview" },
        ...prev,
      ]);
      setDraftTitle("");
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "Submit failed" });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const doStake = async (m: Manuscript) => {
    setToast({ icon: <Coins className="w-4 h-4" />, text: `Staking for ${m.id}…` });
    await stakeForReview(m.id, 50);
    setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Stake locked ✓` });
  };

  const startReview = (m: Manuscript) => {
    setReviewFor(m);
    setOpenReview(true);
  };

  const doSubmitReview = async () => {
    if (!reviewFor) return;
    try {
      setSubmitting(true);
      if (reviewFile) {
        setToast({ icon: <FileUp className="w-4 h-4" />, text: "Uploading review…" });
        const cid = await uploadToIPFS(reviewFile, setUploadProgress);
        const res = await submitReview(reviewFor.id, cid, reviewAnon);
        setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Review logged ✓ ${short(res.txHash)}` });
      } else {
        await new Promise((r) => setTimeout(r, 400));
        const res = await submitReview(reviewFor.id, "bafybeigdtextrev", reviewAnon);
        setToast({ icon: <CheckCheck className="w-4 h-4" />, text: `Review logged ✓ ${short(res.txHash)}` });
      }
      setOpenReview(false);
      setReviewText("");
      setReviewFile(null);
      setReviewFor(null);
    } catch {
      setToast({ icon: <AlertCircle className="w-4 h-4" />, text: "Review submit failed" });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen text-foreground bg-background relative overflow-hidden aurora">
      {/* gentle particle field */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-foreground/40"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>

      {/* Top Nav */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className="sticky top-0 z-50 border-b border-border backdrop-blur bg-background/60"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="h-9 w-9 rounded-2xl grid place-items-center shadow-glow bg-gradient-to-br from-primary/80 to-secondary/80"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <div>
              <div className="text-lg font-extrabold tracking-tight">Axon</div>
              <div className="text-xs text-muted-foreground -mt-1">Token-Aligned Peer Review</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-muted-foreground">
            <a className="hover:text-foreground transition-colors" href="#explore">Explore</a>
            <a className="hover:text-foreground transition-colors" href="#submit">Submit</a>
            <a className="hover:text-foreground transition-colors" href="#reviews">Reviews</a>
            <a className="hover:text-foreground transition-colors" href="#profile">Profile</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-2xl">
              <Bell className="w-5 h-5" />
            </Button>

            {account ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-2xl" variant="secondary">
                    <User className="w-4 h-4 mr-2" /> {short(account)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => account && navigator.clipboard.writeText(account)}>
                    <Copy className="w-4 h-4 mr-2" /> Copy address
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <History className="w-4 h-4 mr-2" /> Activity
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAccount(null)}>
                    <LogOut className="w-4 h-4 mr-2" /> Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="rounded-2xl" onClick={doConnect}>Connect Wallet</Button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6" id="explore">
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div variants={fadeUp}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Transparent, Incentivized <span className="text-secondary">Peer Review</span> for Science
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Stake to review. Earn token rewards for on-time, high-quality feedback. Immutable, auditable history — all on-chain.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-2xl" onClick={() => setOpenSubmit(true)}>
                <FileUp className="w-4 h-4 mr-2" /> Submit Manuscript
              </Button>
              <Button className="rounded-2xl" variant="secondary" onClick={() => setTab("explore")}>Browse Calls</Button>
              <Button className="rounded-2xl" variant="ghost">
                <Github className="w-4 h-4 mr-2" /> Docs
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              {[
                { icon: <ShieldCheck className="w-4 h-4" />, text: "On-chain reputation" },
                { icon: <Timer className="w-4 h-4" />, text: "SLA-backed deadlines" },
                { icon: <Coins className="w-4 h-4" />, text: "Token rewards" },
              ].map((f, i) => (
                <motion.div key={i} variants={fadeUp} className="rounded-xl px-3 py-2 flex items-center gap-2 bg-card/80 border border-border backdrop-blur-xl">
                  {f.icon}<span>{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-3xl p-1 bg-card/80 border border-border backdrop-blur-xl shadow-glow">
            <div className="rounded-3xl p-6 bg-card/60">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Live Opportunities</div>
              <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3">
                {manuscripts.map((m) => (
                  <motion.div key={m.id} variants={fadeUp} {...hoverLift}>
                    <Card className="bg-card/80 border-border backdrop-blur-xl transition">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between gap-3">
                          <span>{m.title}</span>
                          <Badge variant="secondary">{m.field}</Badge>
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-3 text-muted-foreground">
                          <span>Author {m.author}</span>
                          <span className="opacity-50">•</span>
                          <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {m.deadlineDays} days</span>
                          <span className="opacity-50">•</span>
                          <span className="flex items-center gap-1"><Coins className="w-4 h-4" /> {m.bounty} AXN</span>
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Req. Rep ≥ {m.reputationReq}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <a className="flex items-center" href={`https://ipfs.io/ipfs/${m.cid}`} target="_blank" rel="noreferrer">
                              <FileText className="w-4 h-4 mr-2" /> View
                            </a>
                          </Button>
                          <Button size="sm" className="rounded-xl" onClick={() => doStake(m)}>Accept & Stake</Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 pb-16" id="reviews">
        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="bg-muted/30 border border-border">
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="submit">Submit</TabsTrigger>
            <TabsTrigger value="myreviews">My Reviews</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Explore */}
          <TabsContent value="explore" className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-96">
                <Input placeholder="Search title / field / CID" className="pl-10 bg-muted/30 border-border" />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <Button variant="outline" className="bg-muted/30 border-border">
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {manuscripts.map((m) => (
                <motion.div key={m.id} variants={fadeUp} {...hoverLift}>
                  <Card className="bg-card/80 border-border backdrop-blur-xl hover:border-foreground/20 transition">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg leading-tight pr-2">{m.title}</CardTitle>
                        <Badge className="shrink-0">{m.field}</Badge>
                      </div>
                      <CardDescription className="text-muted-foreground flex items-center gap-2">
                        <span>Author {m.author}</span>
                        <span className="opacity-50">•</span>
                        <span>ID {m.id}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {m.deadlineDays} days</span>
                        <span className="flex items-center gap-1"><Coins className="w-4 h-4" /> {m.bounty} AXN</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Req. reputation ≥ {m.reputationReq}</div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button size="sm" variant="ghost" className="rounded-xl">
                        <a className="flex items-center" href={`https://ipfs.io/ipfs/${m.cid}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" /> IPFS
                        </a>
                      </Button>
                      <Button size="sm" className="rounded-xl" onClick={() => doStake(m)}>Accept & Stake</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Submit */}
          <TabsContent value="submit" className="mt-6" id="submit">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <Card className="bg-card/80 border-border backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Submit a Manuscript</CardTitle>
                  <CardDescription>Upload your PDF to IPFS, then confirm on-chain.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Enter manuscript title" className="bg-muted/30 border-border mt-1" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>File (PDF)</Label>
                    <Input ref={fileRef} type="file" accept="application/pdf" className="bg-muted/30 border-border mt-1" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Button type="button" variant="outline" className="bg-muted/30 border-border rounded-xl" onClick={() => setAnonymize((v) => !v)}>
                      {anonymize ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {anonymize ? "Anonymized" : "Public"}
                    </Button>
                    <span className="text-muted-foreground">Control visibility of your author identity in the review phase.</span>
                  </div>
                  <Button disabled={!draftTitle || !selectedFile || submitting} className="rounded-2xl" onClick={doSubmitManuscript}>
                    <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit to IPFS & Chain"}
                  </Button>
                  {submitting && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Upload progress</div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* My Reviews */}
          <TabsContent value="myreviews" className="mt-6">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <Card className="bg-card/80 border-border backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>My Review Journey</CardTitle>
                  <CardDescription>Track stakes, deadlines, submissions, and rewards.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Reviewer Reputation</div>
                    <div className="flex items-center gap-3">
                      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-4xl font-black">
                        {reputation}
                      </motion.div>
                      <Badge variant="secondary" className="rounded-xl">On-chain</Badge>
                    </div>
                    <Progress value={reputation} />
                    <div className="text-xs text-muted-foreground">Higher rep unlocks higher bounties and priority matching.</div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Recent Rewards</div>
                    <div className="flex items-center gap-2"><Coins className="w-4 h-4" /> +220 AXN — MSK-2025-003</div>
                    <div className="flex items-center gap-2"><Coins className="w-4 h-4" /> +150 AXN — MSK-2025-001</div>
                    <div className="text-xs text-muted-foreground">Slashing occurs for late or low-quality reviews.</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="mt-6" id="profile">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <Card className="bg-card/80 border-border backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Wallet-linked off-chain profile (Postgres) + on-chain proofs.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Display Name</Label>
                    <Input placeholder="Ada Lovelace" className="bg-muted/30 border-border" />
                    <Label>Field(s) of Expertise</Label>
                    <Input placeholder="ML, Cryptography" className="bg-muted/30 border-border" />
                    <Label>Affiliation (optional)</Label>
                    <Input placeholder="KJSCE" className="bg-muted/30 border-border" />
                  </div>
                  <div className="space-y-3">
                    <Label>Bio</Label>
                    <Textarea rows={6} placeholder="Short reviewer/author bio" className="bg-muted/30 border-border" />
                    <div className="text-xs text-muted-foreground">Only non-sensitive information is stored off-chain.</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="rounded-2xl">Save Profile</Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Submit Dialog */}
      <Dialog open={openSubmit} onOpenChange={setOpenSubmit}>
        <DialogContent className="sm:max-w-lg bg-background/90 border-border text-foreground backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Submit Manuscript</DialogTitle>
            <DialogDescription className="text-muted-foreground">Upload your PDF to IPFS and anchor the record on-chain.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Title</Label>
            <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="bg-muted/30 border-border" />
            <Label>PDF File</Label>
            <Input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} className="bg-muted/30 border-border" />
            <div className="flex items-center gap-3 text-sm">
              <Button type="button" variant="outline" className="bg-muted/30 border-border rounded-xl" onClick={() => setAnonymize((v) => !v)}>
                {anonymize ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {anonymize ? "Anonymized" : "Public"}
              </Button>
              <span className="text-muted-foreground">Control author visibility during review.</span>
            </div>
            {submitting && <Progress value={uploadProgress} />}
          </div>
          <DialogFooter>
            <Button disabled={!draftTitle || !selectedFile || submitting} onClick={doSubmitManuscript} className="rounded-2xl">
              <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={openReview} onOpenChange={setOpenReview}>
        <DialogContent className="sm:max-w-2xl bg-background/90 border-border text-foreground backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Submit Review {reviewFor ? `for ${reviewFor.id}` : ""}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Attach a PDF or paste text. Your stake + deadline applies.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Attach PDF (optional)</Label>
              <Input type="file" accept="application/pdf" onChange={(e) => setReviewFile(e.target.files?.[0] ?? null)} className="bg-muted/30 border-border" />
              <div className="flex items-center gap-3 text-sm">
                <Button type="button" variant="outline" className="bg-muted/30 border-border rounded-xl" onClick={() => setReviewAnon((v) => !v)}>
                  {reviewAnon ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />} {reviewAnon ? "Anonymous" : "Public"}
                </Button>
                <span className="text-muted-foreground">Toggle reviewer anonymity.</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Review (plain text)</Label>
              <Textarea rows={8} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Summary • Strengths • Weaknesses • Reproducibility • Ethics • Score" className="bg-muted/30 border-border" />
            </div>
          </div>
          {submitting && <Progress value={uploadProgress} />}
          <DialogFooter>
            <Button disabled={submitting || (!reviewFile && !reviewText)} onClick={doSubmitReview} className="rounded-2xl">
              <FileUp className="w-4 h-4 mr-2" /> {submitting ? "Submitting…" : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl shadow-glow bg-card/90 border border-border backdrop-blur-xl">
              <div>{toast.icon}</div>
              <div className="text-sm">{toast.text}</div>
              <Button variant="ghost" size="icon" className="rounded-xl ml-2" onClick={() => setToast(null)}>
                <CheckCheck className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border mt-10 bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm text-muted-foreground">
          <div>
            <div className="font-bold text-foreground">Axon</div>
            <div>Decentralized, auditable science validation.</div>
          </div>
          <div>
            <div className="font-semibold text-foreground mb-2">Principles</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Transparency by default</li>
              <li>Aligned token incentives</li>
              <li>Reputation as a public good</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-foreground mb-2">Links</div>
            <ul className="space-y-1">
              <li><a className="hover:text-foreground" href="#">Whitepaper</a></li>
              <li><a className="hover:text-foreground" href="#">GitHub</a></li>
              <li><a className="hover:text-foreground" href="#">Security & Audits</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
