"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Heart, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  PawPrint,
  Calendar,
  FileText,
  ImageIcon,
  Lock,
  Globe,
  Link2,
  Eye,
  Upload,
  X,
  Check,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

const steps = [
  { id: 1, title: "Basic Info", description: "Who are you remembering?" },
  { id: 2, title: "Their Story", description: "Tell their story" },
  { id: 3, title: "Photos & Media", description: "Add memories" },
  { id: 4, title: "Privacy & Review", description: "Final settings" },
]

type MemorialType = "human" | "pet"
type PrivacyLevel = "public" | "unlisted" | "password"

interface FormData {
  // Step 1
  memorialType: MemorialType
  firstName: string
  lastName: string
  birthDate: string
  deathDate: string
  // Step 2
  shortBio: string
  fullStory: string
  // Step 3
  photos: File[]
  photosPreviews: string[]
  // Step 4
  privacy: PrivacyLevel
  password: string
}

export default function CreateMemorialPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    memorialType: "human",
    firstName: "",
    lastName: "",
    birthDate: "",
    deathDate: "",
    shortBio: "",
    fullStory: "",
    photos: [],
    photosPreviews: [],
    privacy: "public",
    password: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSaveDraft = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPreviews = files.map(file => URL.createObjectURL(file))
    updateFormData({
      photos: [...formData.photos, ...files],
      photosPreviews: [...formData.photosPreviews, ...newPreviews]
    })
  }

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    const newPreviews = formData.photosPreviews.filter((_, i) => i !== index)
    URL.revokeObjectURL(formData.photosPreviews[index])
    updateFormData({ photos: newPhotos, photosPreviews: newPreviews })
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log("Memorial created:", formData)
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.firstName.trim() !== "" && formData.birthDate !== ""
      case 2:
        return formData.shortBio.trim() !== ""
      case 3:
        return true // Photos are optional
      case 4:
        return formData.privacy !== "password" || formData.password.trim() !== ""
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5">
              <Heart className="w-5 h-5 text-[#e07a3f] fill-[#e07a3f]" />
              <span className="text-xl font-medium tracking-tight text-[#e07a3f]">
                evermissed
              </span>
            </Link>

            {/* Save Draft Button */}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="border-[#e07a3f]/30 text-[#e07a3f] hover:bg-[#e07a3f]/5"
            >
              {isSaving ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#f5f0eb] h-1">
          <div 
            className="h-full bg-[#e07a3f] transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl md:text-4xl text-[#3a3a3a] mb-3">
              Honor Someone Special
            </h1>
            <p className="text-[#6a6a6a] text-lg">
              Create a beautiful lasting tribute in just a few minutes
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id)
                  }}
                  disabled={step.id > currentStep}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    step.id === currentStep
                      ? "bg-[#e07a3f] text-white"
                      : step.id < currentStep
                      ? "bg-[#e07a3f]/10 text-[#e07a3f] hover:bg-[#e07a3f]/20 cursor-pointer"
                      : "bg-[#f0ebe6] text-[#9a9a9a]"
                  }`}
                >
                  <span className="text-sm font-medium">{step.id}</span>
                  <span className="hidden md:inline text-sm">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    step.id < currentStep ? "bg-[#e07a3f]" : "bg-[#e0dbd6]"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-8 md:p-10">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl text-[#3a3a3a] mb-2">
                    Who are you remembering?
                  </h2>
                  <p className="text-[#6a6a6a]">
                    Tell us about your loved one
                  </p>
                </div>

                {/* Memorial Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-[#3a3a3a] mb-3">
                    Memorial Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => updateFormData({ memorialType: "human" })}
                      className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.memorialType === "human"
                          ? "border-[#e07a3f] bg-[#e07a3f]/5"
                          : "border-[#e0dbd6] hover:border-[#e07a3f]/50"
                      }`}
                    >
                      <User className={`w-5 h-5 ${
                        formData.memorialType === "human" ? "text-[#e07a3f]" : "text-[#9a9a9a]"
                      }`} />
                      <span className={`font-medium ${
                        formData.memorialType === "human" ? "text-[#e07a3f]" : "text-[#6a6a6a]"
                      }`}>
                        Human
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFormData({ memorialType: "pet" })}
                      className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.memorialType === "pet"
                          ? "border-[#e07a3f] bg-[#e07a3f]/5"
                          : "border-[#e0dbd6] hover:border-[#e07a3f]/50"
                      }`}
                    >
                      <PawPrint className={`w-5 h-5 ${
                        formData.memorialType === "pet" ? "text-[#e07a3f]" : "text-[#9a9a9a]"
                      }`} />
                      <span className={`font-medium ${
                        formData.memorialType === "pet" ? "text-[#e07a3f]" : "text-[#6a6a6a]"
                      }`}>
                        Pet
                      </span>
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData({ firstName: e.target.value })}
                      placeholder={formData.memorialType === "pet" ? "Pet's name" : "First name"}
                      className="w-full px-4 py-3 rounded-xl border border-[#e0dbd6] focus:border-[#e07a3f] focus:ring-2 focus:ring-[#e07a3f]/20 outline-none transition-all duration-300 bg-white text-[#3a3a3a] placeholder:text-[#a0a0a0]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      Last Name {formData.memorialType === "human" && "(optional)"}
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData({ lastName: e.target.value })}
                      placeholder={formData.memorialType === "pet" ? "Breed (optional)" : "Last name"}
                      className="w-full px-4 py-3 rounded-xl border border-[#e0dbd6] focus:border-[#e07a3f] focus:ring-2 focus:ring-[#e07a3f]/20 outline-none transition-all duration-300 bg-white text-[#3a3a3a] placeholder:text-[#a0a0a0]"
                    />
                  </div>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      <Calendar className="w-4 h-4 inline mr-2 text-[#9a9a9a]" />
                      Birth Date *
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => updateFormData({ birthDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#e0dbd6] focus:border-[#e07a3f] focus:ring-2 focus:ring-[#e07a3f]/20 outline-none transition-all duration-300 bg-white text-[#3a3a3a]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      <Calendar className="w-4 h-4 inline mr-2 text-[#9a9a9a]" />
                      Passing Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.deathDate}
                      onChange={(e) => updateFormData({ deathDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#e0dbd6] focus:border-[#e07a3f] focus:ring-2 focus:ring-[#e07a3f]/20 outline-none transition-all duration-300 bg-white text-[#3a3a3a]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Their Story */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl text-[#3a3a3a] mb-2">
                    Tell Their Story
                  </h2>
                  <p className="text-[#6a6a6a]">
                    Share memories and stories that capture their spirit
                  </p>
                </div>

                {/* Short Bio */}
                <div>
                  <label className="block text-sm font-medium text-[#3a3a3a] mb-2">
                    <FileText className="w-4 h-4 inline mr-2 text-[#9a9a9a]" />
                    Short Biography *
                  </label>
                  <p className="text-sm text-[#9a9a9a] mb-3">
                    A brief description that will appear on the memorial card
                  </p>
                  <textarea
                    value={formData.shortBio}
                    onChange={(e) => updateFormData({ shortBio: e.target.value })}
                    placeholder="A loving mother, grandmother, and friend who touched everyone she met with her warmth and kindness..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl border border-[#e0dbd6] focus:border-[#e07a3f] focus:ring-2 focus:ring-[#e07a3f]/20 outline-none transition-all duration-300 bg-white text-[#3a3a3a] placeholder:text-[#a0a0a0] resize-none"
                  />
                  <p className="text-xs text-[#9a9a9a] mt-2 text-right">
                    {formData.shortBio.length}/200 characters
                  </p>
                </div>

                {/* Full Story */}
                <div>
                  <label className="block text-sm font-medium text-[#3a3a3a] mb-2">
                    <Sparkles className="w-4 h-4 inline mr-2 text-[#9a9a9a]" />
                    Full Story (optional)
                  </label>
                  <p className="text-sm text-[#9a9a9a] mb-3">
                    Share their life story, achievements, passions, and cherished memories
                  </p>
                  <textarea
                    value={formData.fullStory}
                    onChange={(e) => updateFormData({ fullStory: e.target.value })}
                    placeholder="Share the story of their life... their childhood, passions, career, family, and all the moments that made them who they were..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border border-[#e0dbd6] focus:border-[#e07a3f] focus:ring-2 focus:ring-[#e07a3f]/20 outline-none transition-all duration-300 bg-white text-[#3a3a3a] placeholder:text-[#a0a0a0] resize-none"
                  />
                </div>

                {/* Writing Tips */}
                <div className="bg-[#f8f5f2] rounded-xl p-5">
                  <h4 className="text-sm font-medium text-[#3a3a3a] mb-2">Writing Tips</h4>
                  <ul className="text-sm text-[#6a6a6a] space-y-1">
                    <li>Share their personality traits and what made them unique</li>
                    <li>Include favorite hobbies, passions, or accomplishments</li>
                    <li>Mention special relationships and loved ones</li>
                    <li>Add meaningful quotes or sayings they loved</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Photos & Media */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl text-[#3a3a3a] mb-2">
                    Add Photos & Media
                  </h2>
                  <p className="text-[#6a6a6a]">
                    Upload photos to bring their memorial to life
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e0dbd6] hover:border-[#e07a3f] rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 hover:bg-[#e07a3f]/5"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 bg-[#e07a3f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-[#e07a3f]" />
                  </div>
                  <h3 className="font-medium text-[#3a3a3a] mb-2">
                    Click to upload photos
                  </h3>
                  <p className="text-sm text-[#9a9a9a]">
                    or drag and drop your images here
                  </p>
                  <p className="text-xs text-[#a0a0a0] mt-3">
                    Supports JPG, PNG, GIF up to 10MB each
                  </p>
                </div>

                {/* Photo Previews */}
                {formData.photosPreviews.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[#3a3a3a] mb-4">
                      <ImageIcon className="w-4 h-4 inline mr-2 text-[#9a9a9a]" />
                      Uploaded Photos ({formData.photosPreviews.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.photosPreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden">
                          <Image
                            src={preview}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-[#e07a3f] text-white text-xs px-2 py-1 rounded-full">
                              Main Photo
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#9a9a9a] mt-3">
                      The first photo will be used as the main memorial image
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-[#f8f5f2] rounded-xl p-5">
                  <h4 className="text-sm font-medium text-[#3a3a3a] mb-2">Tips for Photos</h4>
                  <ul className="text-sm text-[#6a6a6a] space-y-1">
                    <li>Choose a clear, well-lit photo for the main image</li>
                    <li>Include photos from different life stages</li>
                    <li>Add photos with family and friends</li>
                    <li>You can always add more photos later</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Privacy & Review */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl text-[#3a3a3a] mb-2">
                    Privacy & Review
                  </h2>
                  <p className="text-[#6a6a6a]">
                    Choose who can see this memorial
                  </p>
                </div>

                {/* Privacy Options */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[#3a3a3a] mb-3">
                    Privacy Setting
                  </label>

                  {/* Public */}
                  <button
                    type="button"
                    onClick={() => updateFormData({ privacy: "public" })}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.privacy === "public"
                        ? "border-[#e07a3f] bg-[#e07a3f]/5"
                        : "border-[#e0dbd6] hover:border-[#e07a3f]/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      formData.privacy === "public" ? "bg-[#e07a3f]" : "bg-[#f0ebe6]"
                    }`}>
                      <Globe className={`w-5 h-5 ${
                        formData.privacy === "public" ? "text-white" : "text-[#9a9a9a]"
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        formData.privacy === "public" ? "text-[#e07a3f]" : "text-[#3a3a3a]"
                      }`}>
                        Public
                      </h4>
                      <p className="text-sm text-[#6a6a6a]">
                        Anyone can find and view this memorial
                      </p>
                    </div>
                  </button>

                  {/* Unlisted */}
                  <button
                    type="button"
                    onClick={() => updateFormData({ privacy: "unlisted" })}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.privacy === "unlisted"
                        ? "border-[#e07a3f] bg-[#e07a3f]/5"
                        : "border-[#e0dbd6] hover:border-[#e07a3f]/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      formData.privacy === "unlisted" ? "bg-[#e07a3f]" : "bg-[#f0ebe6]"
                    }`}>
                      <Link2 className={`w-5 h-5 ${
                        formData.privacy === "unlisted" ? "text-white" : "text-[#9a9a9a]"
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        formData.privacy === "unlisted" ? "text-[#e07a3f]" : "text-[#3a3a3a]"
                      }`}>
                        Unlisted
                      </h4>
                      <p className="text-sm text-[#6a6a6a]">
                        Only people with the link can view this memorial
                      </p>
                    </div>
                  </button>

                  {/* Password Protected */}
                  <button
                    type="button"
                    onClick={() => updateFormData({ privacy: "password" })}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.privacy === "password"
                        ? "border-[#e07a3f] bg-[#e07a3f]/5"
                        : "border-[#e0dbd6] hover:border-[#e07a3f]/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      formData.privacy === "password" ? "bg-[#e07a3f]" : "bg-[#f0ebe6]"
                    }`}>
                      <Lock className={`w-5 h-5 ${
                        formData.privacy === "password" ? "text-white" : "text-[#9a9a9a]"
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        formData.privacy === "password" ? "text-[#e07a3f]" : "text-[#3a3a3a]"
                      }`}>
                        Password Protected
                      </h4>
                      <p className="text-sm text-[#6a6a6a]">
                        Viewers need a password to access this memorial
                      </p>
                    </div>
                  </button>

                  {/* Password Input */}
                  {formData.privacy === "password" && (
                    <div className="pl-14">
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateFormData({ password: e.target.value })}
                        placeholder="Enter a password"
                        className="w-full px-4 py-3 rounded-xl border border-[#e0dbd6] focus:border-[#e07a3f] focus:ring-2 focus:ring-[#e07a3f]/20 outline-none transition-all duration-300 bg-white text-[#3a3a3a] placeholder:text-[#a0a0a0]"
                      />
                    </div>
                  )}
                </div>

                {/* Review Summary */}
                <div className="bg-[#f8f5f2] rounded-xl p-6">
                  <h3 className="font-medium text-[#3a3a3a] mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#9a9a9a]" />
                    Memorial Preview
                  </h3>
                  <div className="bg-white rounded-xl p-5 border border-[#e0dbd6]">
                    <div className="flex items-center gap-4 mb-4">
                      {formData.photosPreviews.length > 0 ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                          <Image
                            src={formData.photosPreviews[0]}
                            alt="Memorial"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#f0ebe6] flex items-center justify-center flex-shrink-0">
                          {formData.memorialType === "pet" ? (
                            <PawPrint className="w-8 h-8 text-[#c0b8b0]" />
                          ) : (
                            <User className="w-8 h-8 text-[#c0b8b0]" />
                          )}
                        </div>
                      )}
                      <div>
                        <h4 className="font-serif text-xl text-[#3a3a3a]">
                          {formData.firstName || "First Name"} {formData.lastName}
                        </h4>
                        <p className="text-sm text-[#9a9a9a]">
                          {formData.birthDate || "Birth Date"} — {formData.deathDate || "Present"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      {formData.shortBio || "No biography added yet."}
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#f0ebe6]">
                      <span className="text-xs text-[#9a9a9a]">
                        {formData.photosPreviews.length} photos
                      </span>
                      <span className="text-xs text-[#9a9a9a]">
                        {formData.privacy === "public" && "Public memorial"}
                        {formData.privacy === "unlisted" && "Unlisted memorial"}
                        {formData.privacy === "password" && "Password protected"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#f0ebe6]">
              {currentStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  className="text-[#6a6a6a] hover:text-[#3a3a3a]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="bg-[#e07a3f] text-white hover:bg-[#d96c2f] px-8 rounded-full disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep)}
                  className="bg-[#e07a3f] text-white hover:bg-[#d96c2f] px-8 rounded-full disabled:opacity-50"
                >
                  Create Memorial
                  <Heart className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-[#9a9a9a] mt-8">
            Need help? <a href="#" className="text-[#e07a3f] hover:underline">Contact our support team</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
