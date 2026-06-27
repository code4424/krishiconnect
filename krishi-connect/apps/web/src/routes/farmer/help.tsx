import { createFileRoute } from '@tanstack/react-router';
import {
  HelpCircle,
  MessageSquare,
  Phone,
  BookOpen,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/farmer/help')({
  component: HelpSupportPage,
});

function HelpSupportPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary mb-6">
           <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">How can we help?</h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto">Search our knowledge base or get in touch with our support team available 24/7.</p>
        
        <div className="relative max-w-2xl mx-auto mt-8">
           <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
           <Input 
             className="pl-12 h-16 rounded-2xl border-gray-100 shadow-xl placeholder:text-gray-400 text-lg font-medium focus-visible:ring-primary/20" 
             placeholder="Search for topics, features, or troubleshooting..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <ContactCard 
           icon={<MessageSquare className="w-6 h-6" />}
           title="Chat with Support"
           desc="Response time: < 5 mins"
           action="Start Chat"
        />
        <ContactCard 
           icon={<Phone className="w-6 h-6" />}
           title="Call Assistance"
           desc="Available 9 AM - 8 PM"
           action="1800-456-7890"
        />
        <ContactCard 
           icon={<FileText className="w-6 h-6" />}
           title="Ticket System"
           desc="For complex inquiries"
           action="Open Ticket"
        />
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
           <BookOpen className="w-6 h-6 text-primary" />
           Frequently Asked Questions
        </h2>
        
        <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 shadow-sm">
           <Accordion type="single" collapsible className="w-full">
             {faqs.map((faq, i) => (
               <AccordionItem key={i} value={`item-${i}`} className="border-b border-gray-100 py-2 last:border-0">
                 <AccordionTrigger className="text-left font-bold text-gray-700 hover:text-primary transition-colors text-lg py-4">
                   {faq.q}
                 </AccordionTrigger>
                 <AccordionContent className="text-gray-500 leading-relaxed text-base pb-6">
                   {faq.a}
                 </AccordionContent>
               </AccordionItem>
             ))}
           </Accordion>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, desc, action }: any) {
  return (
    <Card className="rounded-3xl border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white border border-gray-50">
      <CardContent className="p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
           {icon}
        </div>
        <div>
           <h3 className="font-black text-gray-900">{title}</h3>
           <p className="text-xs font-bold text-gray-400 mt-1">{desc}</p>
        </div>
        <Button variant="outline" className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest h-10 hover:bg-primary hover:text-white border-gray-100 group-hover:border-primary transition-all">
           {action}
        </Button>
      </CardContent>
    </Card>
  );
}
