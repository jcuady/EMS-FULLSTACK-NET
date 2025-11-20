"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Download,
  Clock,
  Users,
  DollarSign,
  Shield,
  HelpCircle,
  Send
} from "lucide-react"

type FAQ = {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I clock in for work?",
    answer: "Navigate to the Working Tracker page or Employee Dashboard. Click the 'Clock In' button. You can add optional notes about your shift. The system will record your clock-in time automatically.",
    category: "Attendance"
  },
  {
    id: "2",
    question: "How do I view my payslips?",
    answer: "Go to the 'My Payslips' page from the employee navigation menu. You'll see all your payroll history with the ability to download individual payslips as PDF files.",
    category: "Payroll"
  },
  {
    id: "3",
    question: "Can I edit my profile information?",
    answer: "Visit the 'My Profile' page and click the 'Edit Profile' button. You can update your contact information, address, and other personal details.",
    category: "Profile"
  },
  {
    id: "4",
    question: "What happens if I forget to clock out?",
    answer: "Contact your manager or HR administrator immediately. They can manually adjust your attendance record through the admin panel.",
    category: "Attendance"
  },
  {
    id: "5",
    question: "How is my overtime calculated?",
    answer: "Any hours worked beyond your scheduled working hours (typically 8 hours per day) are automatically calculated as overtime.",
    category: "Payroll"
  }
]

const guides = [
  {
    icon: Clock,
    title: "Getting Started",
    description: "Learn the basics of using the system",
    steps: [
      "Log in with your credentials",
      "Explore your dashboard",
      "Update your profile",
      "Familiarize with navigation"
    ]
  },
  {
    icon: Users,
    title: "Managing Attendance",
    description: "Track your work hours",
    steps: [
      "Use Working Tracker to clock in",
      "Add notes for remote work",
      "Remember to clock out",
      "Review attendance history"
    ]
  },
  {
    icon: DollarSign,
    title: "Understanding Payroll",
    description: "View and download payslips",
    steps: [
      "Navigate to My Payslips",
      "View salary breakdown",
      "Download payslips",
      "Check year-to-date totals"
    ]
  },
  {
    icon: Shield,
    title: "Security Best Practices",
    description: "Keep your account secure",
    steps: [
      "Use a strong password",
      "Never share credentials",
      "Log out on shared computers",
      "Report suspicious activity"
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactMessage, setContactMessage] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)

  const categories = ["all", "Attendance", "Payroll", "Profile", "Security"]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Thank you! We will get back to you soon.')
    setContactName("")
    setContactEmail("")
    setContactMessage("")
    setSubmitLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Help & Documentation</h1>
        <p className="text-zinc-400 mt-1">Find answers and learn how to use the system</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles, guides, and FAQs..."
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, title: "User Guide", desc: "Complete documentation", color: "blue" },
          { icon: Video, title: "Video Tutorials", desc: "Step-by-step videos", color: "green" },
          { icon: HelpCircle, title: "FAQs", desc: "Common questions", color: "purple" },
          { icon: MessageCircle, title: "Contact Support", desc: "Get help", color: "yellow" }
        ].map((item, i) => (
          <Card key={i} className={`bg-zinc-900 border-zinc-800 hover:border-${item.color}-600 transition-colors cursor-pointer`}>
            <CardContent className="pt-6 text-center">
              <div className={`p-3 bg-${item.color}-600/20 rounded-full w-fit mx-auto mb-3`}>
                <item.icon className={`w-6 h-6 text-${item.color}-500`} />
              </div>
              <p className="text-white font-medium">{item.title}</p>
              <p className="text-xs text-zinc-400 mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Getting Started Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((guide, index) => (
              <Card key={index} className="bg-zinc-800 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <guide.icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{guide.title}</h3>
                      <p className="text-sm text-zinc-400 mb-3">{guide.description}</p>
                      <ul className="space-y-2">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedCategory === category ? "bg-blue-600" : "border-zinc-700 hover:border-blue-600"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFaqs.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No FAQs found</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-zinc-800">
                  <AccordionTrigger className="text-white hover:text-blue-400">
                    <div className="flex items-start gap-2 text-left">
                      <Badge variant="outline" className="border-zinc-700 text-xs">
                        {faq.category}
                      </Badge>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Contact Support</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Name</label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Email</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Message</label>
              <Textarea
                value={contactMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContactMessage(e.target.value)}
                placeholder="Describe your issue..."
                required
                className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
              />
            </div>
            <Button 
              type="submit" 
              disabled={submitLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitLoading ? "Sending..." : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Employee Management System v1.0.0</p>
              <p className="text-sm text-zinc-400">Last updated: November 18, 2025</p>
            </div>
            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
              <Download className="w-4 h-4 mr-2" />
              Download Manual
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
