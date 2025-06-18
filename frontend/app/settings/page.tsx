"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useUserProfileStore } from "@/store/userProfileStore"
import { X, Plus } from "lucide-react"

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const { theme, setTheme } = useTheme()
  
  // Get user profile data and update functions from store
  const { profile, updateProfile, addTopicOfInterest, removeTopicOfInterest, updateSkill } = useUserProfileStore()
  // Set up form state
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    department: profile.department,
    role: profile.role,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const [newTopic, setNewTopic] = useState('')
  const [isAddingTopic, setIsAddingTopic] = useState(false)
  const [selectedLearningStyle, setSelectedLearningStyle] = useState(profile.learningStyle || 'visual')

  // Initialize default tab from URL params if present
  const [activeTab, setActiveTab] = useState(tabParam || "account")
  
  // Update form when profile changes
  useEffect(() => {
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      department: profile.department,
      role: profile.role,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    setSelectedLearningStyle(profile.learningStyle || 'visual')
  }, [profile])
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }
  
  // Handle saving personal information
  const handleSavePersonalInfo = () => {
    updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      department: formData.department,
      role: formData.role
    })
    toast.success("Personal information updated successfully")
  }
  
  // Handle password change
  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    
    if (!formData.currentPassword) {
      toast.error("Please enter your current password")
      return
    }
    
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }
    
    // In a real app, this would be an API call to change the password
    toast.success("Password changed successfully")
    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
  }
  
  // Handle adding a new topic of interest
  const handleAddTopic = () => {
    if (newTopic.trim()) {
      addTopicOfInterest(newTopic.trim())
      setNewTopic('')
      setIsAddingTopic(false)
      toast.success("Topic added successfully")
    }
  }
  
  // Handle updating learning style
  const handleUpdateLearningStyle = () => {
    updateProfile({ learningStyle: selectedLearningStyle })
    toast.success("Learning style updated successfully")
  }
  
  // Handle updating skill level
  const handleSkillLevelChange = (skillName: string, level: number) => {
    updateSkill(skillName, level)
    toast.success(`${skillName} skill level updated`)
  }
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Settings" 
        description="Manage your account settings and preferences"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account details and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department" 
                      value={formData.department} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input 
                      id="role" 
                      value={formData.role} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSavePersonalInfo}>Save Personal Info</Button>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-sm font-medium">Learning Preferences</h3>
                <div className="space-y-2">
                  <Label htmlFor="learningStyle">Preferred Learning Style</Label>
                  <Select 
                    value={selectedLearningStyle} 
                    onValueChange={setSelectedLearningStyle}
                  >
                    <SelectTrigger id="learningStyle">
                      <SelectValue placeholder="Select a learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visual">Visual</SelectItem>
                      <SelectItem value="Auditory">Auditory</SelectItem>
                      <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                      <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                      <SelectItem value="Multimodal">Multimodal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Topics of Interest</Label>
                    {!isAddingTopic ? (
                      <Button variant="outline" size="sm" onClick={() => setIsAddingTopic(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Topic
                      </Button>
                    ) : null}
                  </div>
                  
                  {isAddingTopic && (
                    <div className="flex gap-2">
                      <Input 
                        value={newTopic}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTopic(e.target.value)}
                        placeholder="Enter a new topic"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleAddTopic}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsAddingTopic(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.topicsOfInterest.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="group flex items-center gap-1">
                        {topic}
                        <X 
                          className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" 
                          onClick={() => removeTopicOfInterest(topic)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button onClick={handleUpdateLearningStyle}>Save Learning Preferences</Button>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-sm font-medium">Skills</h3>
                {profile.skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`skill-${index}`}>{skill.name}</Label>
                      <span className="text-sm text-muted-foreground">
                        {['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][skill.level - 1]}
                      </span>
                    </div>
                    <Select 
                      value={String(skill.level)} 
                      onValueChange={(value) => handleSkillLevelChange(skill.name, parseInt(value))}
                    >
                      <SelectTrigger id={`skill-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Beginner</SelectItem>
                        <SelectItem value="2">Basic</SelectItem>
                        <SelectItem value="3">Intermediate</SelectItem>
                        <SelectItem value="4">Advanced</SelectItem>
                        <SelectItem value="5">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-sm font-medium">Security</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="2fa" />
                  <Label htmlFor="2fa">Enable two-factor authentication</Label>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword}>Change Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        

        
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Theme</h3>
                <div className="space-y-2">
                  <Label htmlFor="theme">Color Theme</Label>
                  <Select
                    value={theme || 'system'}
                    onValueChange={(value) => {
                      setTheme(value);
                      updateProfile({ theme: value });
                      toast.success("Theme updated successfully");
                    }}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Display</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-motion">Reduce motion</Label>
                    <Switch id="reduce-motion" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="font-size">Larger text</Label>
                    <Switch id="font-size" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
