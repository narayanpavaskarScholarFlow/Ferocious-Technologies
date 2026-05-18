"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserCircle, 
  GraduationCap, 
  CalendarDays, 
  Banknote, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  FileBadge,
  ShieldCheck,
  Send,
  Plus,
  CalendarCheck,
  ArchiveX,
  Youtube,
  BookOpen,
  HelpCircle,
  Play,
  ChevronRight,
  ArrowRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SystemUser, TrainingAssignment, UserLeave, SalarySlip, Training, QuizQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, setDocumentNonBlocking, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PersonnelPortalProps {
  currentUser: SystemUser | null;
  assignments: TrainingAssignment[];
  leaves: UserLeave[];
  slips: SalarySlip[];
  holidays: any[];
  title?: string;
}

export function PersonnelPortal({ currentUser, assignments, leaves, slips, holidays, title = 'Personnel Portal' }: PersonnelPortalProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Training Hub States
  const [isTrainingHubOpen, setIsTrainingHubOpen] = useState(false);
  const [activeTraining, setActiveTraining] = useState<{assignment: TrainingAssignment; training: Training} | null>(null);
  const [hubTab, setHubTab] = useState('study');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const trainingsQuery = useMemoFirebase(() => collection(db, 'trainings'), [db]);
  const { data: allTrainings } = useCollection<Training>(trainingsQuery);

  const myAssignments = useMemo(() => assignments.filter(a => a.userId === currentUser?.id), [assignments, currentUser]);
  const myLeaves = useMemo(() => leaves.filter(l => l.userId === currentUser?.id), [leaves, currentUser]);
  const mySlips = useMemo(() => slips.filter(s => s.userId === currentUser?.id), [slips, currentUser]);

  const isLateForPlanning = useMemo(() => {
    const today = new Date();
    return today.getDate() > 5;
  }, []);

  const handleLaunchHub = (asg: TrainingAssignment) => {
    const training = allTrainings?.find(t => t.id === asg.trainingId);
    if (!training) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Curriculum metadata missing for this node." });
      return;
    }
    setActiveTraining({ assignment: asg, training });
    setIsTrainingHubOpen(true);
    setHubTab('study');
    setUserAnswers({});
    setQuizScore(null);
  };

  const handleSubmitQuiz = () => {
    if (!activeTraining?.training.quiz) return;
    
    let correct = 0;
    activeTraining.training.quiz.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });

    const total = activeTraining.training.quiz.length;
    const score = Math.round((correct / total) * 100);
    setQuizScore(score);

    if (score >= 80) {
      const updatedAsg: TrainingAssignment = {
        ...activeTraining.assignment,
        status: 'Completed',
        completionDate: new Date().toISOString().split('T')[0],
        score
      };
      setDocumentNonBlocking(doc(db, 'training_assignments', updatedAsg.id), updatedAsg, { merge: true });
      toast({
        title: "Assessment Certified",
        description: `Score: ${score}%. Protocol certification released for download.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Certification Failed",
        description: `Score: ${score}%. Minimum 80% required for certification. Please review materials and retry.`,
      });
    }
  };

  const handleSubmitPlannedLeave = () => {
    if (!currentUser) return;
    if (isLateForPlanning) {
      toast({ variant: "destructive", title: "Temporal Lock Active", description: "Monthly planning matrix must be submitted before the 5th." });
      return;
    }
    // ... logic same as existing
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <UserCircle className="h-4 w-4" />
            Identity Dashboard
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-slate-400 font-medium">{title.split(' ').slice(-1)}</span>
          </h2>
        </div>

        <Card className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-xl flex items-center gap-8">
           <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
              <p className="text-xl font-display font-bold text-primary">{currentUser?.efficiency || 0}%</p>
           </div>
           <div className="h-8 w-px bg-slate-100" />
           <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-bold uppercase">{currentUser?.status || 'Offline'}</Badge>
           </div>
        </Card>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="dashboard" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Overview</TabsTrigger>
          <TabsTrigger value="training" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all relative">
            My Training Matrix
            {myAssignments.filter(a => a.status !== 'Completed').length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] border-2 border-white animate-pulse">
                {myAssignments.filter(a => a.status !== 'Completed').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="leaves" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Leaves & Holidays</TabsTrigger>
          <TabsTrigger value="slips" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Salary Slips</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="m-0 space-y-8">
           <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <FileBadge className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest">Personal Curriculum Nodes</h3>
                 </div>
              </div>
              <Table>
                 <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                       <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Program Title</TableHead>
                       <TableHead className="font-bold text-[10px] uppercase text-slate-400">Target Date</TableHead>
                       <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                       <TableHead className="text-right px-10">Certification</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {myAssignments.map((asg) => (
                       <TableRow key={asg.id} className="h-20 border-slate-50 hover:bg-slate-50/30 transition-colors group">
                          <TableCell className="px-10">
                             <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-[#001F3D] uppercase">{asg.trainingTitle}</span>
                                <span className="text-[9px] text-slate-400 font-code uppercase mt-1">ID: {asg.trainingId}</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-[11px] font-bold text-primary font-code">{asg.targetDate}</TableCell>
                          <TableCell className="text-center">
                             <Badge className={cn(
                                "text-[9px] font-bold uppercase px-3 py-1 rounded-full",
                                asg.status === 'Completed' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                             )}>{asg.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right px-10">
                             {asg.status === 'Completed' ? (
                                <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 font-bold text-[9px] uppercase tracking-widest gap-2" onClick={() => toast({title: "Certificate Dispatch", description: "Official certification downloaded."})}>
                                   <Download className="h-3.5 w-3.5" /> Certificate
                                </Button>
                             ) : (
                                <Button className="h-9 rounded-xl bg-[#001F3D] hover:bg-black text-white font-bold text-[9px] uppercase tracking-widest gap-2" onClick={() => handleLaunchHub(asg)}>
                                   <Play className="h-3.5 w-3.5" /> Launch Hub
                                </Button>
                             )}
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </Card>
        </TabsContent>
        {/* Other TabsContent same as existing */}
      </Tabs>

      {/* High-Fidelity Training Hub Dialog */}
      <Dialog open={isTrainingHubOpen} onOpenChange={setIsTrainingHubOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
           <div className="p-8 bg-[#001F3D] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20"><GraduationCap className="h-8 w-8" /></div>
                 <div>
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight">{activeTraining?.training.title}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Personnel Learning Matrix v2.4</p>
                 </div>
              </div>
              <Badge className="bg-white/10 text-white border-none px-4 h-8 uppercase font-bold text-[10px] tracking-widest">Assigned Node</Badge>
           </div>

           <Tabs value={hubTab} onValueChange={setHubTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-10 bg-slate-50 border-b border-slate-100 shrink-0">
                 <TabsList className="h-14 bg-transparent p-0 gap-8">
                    <TabsTrigger value="study" className="h-full bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 font-bold text-[10px] uppercase tracking-widest">
                       <BookOpen className="h-4 w-4 mr-2" /> Study Materials
                    </TabsTrigger>
                    <TabsTrigger value="video" className="h-full bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 font-bold text-[10px] uppercase tracking-widest">
                       <Youtube className="h-4 w-4 mr-2" /> Video tutorial
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="h-full bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 font-bold text-[10px] uppercase tracking-widest">
                       <HelpCircle className="h-4 w-4 mr-2" /> Knowledge Assessment
                    </TabsTrigger>
                 </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                 <TabsContent value="study" className="m-0 h-full">
                    <div className="max-w-3xl mx-auto space-y-10">
                       <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
                          <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase">Learning Objectives</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-medium">{activeTraining?.training.description}</p>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-3xl hover:border-primary/30 transition-all flex flex-col items-center text-center gap-6 group">
                             <div className="p-4 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform"><FileText className="h-10 w-10" /></div>
                             <div>
                                <h5 className="font-bold text-lg text-[#001F3D] uppercase tracking-tight">Manual & Procedures</h5>
                                <p className="text-xs text-slate-400 mt-2">Formal technical documentation for this protocol.</p>
                             </div>
                             <Button className="w-full bg-[#001F3D] hover:bg-black text-white h-12 rounded-xl uppercase font-bold text-[10px] tracking-widest" asChild>
                                <a href={activeTraining?.training.materialsUrl} target="_blank" rel="noopener noreferrer">
                                   Access Documentation <ChevronRight className="ml-2 h-4 w-4" />
                                </a>
                             </Button>
                          </Card>
                       </div>
                    </div>
                 </TabsContent>

                 <TabsContent value="video" className="m-0 h-full flex flex-col items-center justify-center">
                    {activeTraining?.training.videoUrl ? (
                      <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative border-8 border-slate-900">
                         <iframe 
                            src={activeTraining.training.videoUrl.replace('watch?v=', 'embed/')} 
                            className="w-full h-full"
                            allowFullScreen
                         />
                      </div>
                    ) : (
                      <div className="text-center opacity-30">
                         <Youtube className="h-20 w-20 mx-auto mb-4" />
                         <p className="text-lg font-bold uppercase tracking-widest">No Video Metadata Discovered</p>
                      </div>
                    )}
                 </TabsContent>

                 <TabsContent value="quiz" className="m-0 h-full">
                    <div className="max-w-3xl mx-auto space-y-12">
                       <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                          <div>
                             <h4 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Technical Assessment</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Minimum 80% score required for protocol certification.</p>
                          </div>
                          {quizScore !== null && (
                            <Badge className={cn("text-xl font-display font-bold py-2 px-6 rounded-2xl", quizScore >= 80 ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                               {quizScore}%
                            </Badge>
                          )}
                       </div>

                       <div className="space-y-10">
                          {activeTraining?.training.quiz?.map((q, idx) => (
                             <div key={q.id} className="space-y-6">
                                <p className="text-lg font-bold text-slate-800 leading-tight">
                                   <span className="text-primary mr-3">{idx + 1}.</span> {q.question}
                                </p>
                                <RadioGroup 
                                  value={userAnswers[q.id]} 
                                  onValueChange={(val) => setUserAnswers(prev => ({...prev, [q.id]: val}))}
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                   {q.options.map((opt) => (
                                      <Label key={opt} className={cn(
                                        "p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer hover:bg-slate-50",
                                        userAnswers[q.id] === opt ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-slate-100 bg-white"
                                      )}>
                                         <RadioGroupItem value={opt} className="h-5 w-5" />
                                         <span className="text-sm font-bold text-slate-600 uppercase">{opt}</span>
                                      </Label>
                                   ))}
                                </RadioGroup>
                             </div>
                          ))}
                          
                          {activeTraining?.training.quiz && activeTraining.training.quiz.length > 0 ? (
                            <div className="pt-10 flex justify-center">
                               <Button 
                                  onClick={handleSubmitQuiz}
                                  className="h-16 px-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 flex gap-4"
                               >
                                  <Shield className="h-5 w-5" /> Submit Assessment Protocol
                               </Button>
                            </div>
                          ) : (
                            <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                               <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                               <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">No Assessment Node Configured</p>
                            </div>
                          )}
                       </div>
                    </div>
                 </TabsContent>
              </div>
           </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
