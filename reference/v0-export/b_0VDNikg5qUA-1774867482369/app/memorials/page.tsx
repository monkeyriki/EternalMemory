"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Heart, ImageIcon, Search, MapPin, Calendar, Tag } from "lucide-react"

// Human memorials data
const humanMemorials = [
  {
    id: 1,
    name: "Eleanor Grace Mitchell",
    birthDate: "March 15, 1942",
    deathDate: "December 8, 2024",
    year: 2024,
    image: "/images/memorial-1.jpg",
    description: "A devoted mother, grandmother, and friend who touched every life she encountered with kindness and warmth.",
    tributes: 47,
    photos: 124,
    location: "Boston, MA",
    tags: ["Mother", "Grandmother"],
  },
  {
    id: 2,
    name: "Robert James Sullivan",
    birthDate: "June 22, 1938",
    deathDate: "October 3, 2024",
    year: 2024,
    image: "/images/memorial-2.jpg",
    description: "A man of integrity and humor who dedicated his life to family and community service.",
    tributes: 89,
    photos: 256,
    location: "Chicago, IL",
    tags: ["Father", "Veteran"],
  },
  {
    id: 3,
    name: "Margaret Rose Chen",
    birthDate: "September 1, 1955",
    deathDate: "November 21, 2024",
    year: 2024,
    image: "/images/memorial-3.jpg",
    description: "An inspiring teacher who believed in the potential of every student and left an indelible mark on education.",
    tributes: 156,
    photos: 89,
    location: "San Francisco, CA",
    tags: ["Teacher", "Mother"],
  },
  {
    id: 4,
    name: "David Michael Torres",
    birthDate: "January 12, 1985",
    deathDate: "August 15, 2024",
    year: 2024,
    image: "/images/memorial-4.jpg",
    description: "A beloved son, brother, and friend whose adventurous spirit and generous heart inspired all who knew him.",
    tributes: 203,
    photos: 312,
    location: "Austin, TX",
    tags: ["Son", "Brother"],
  },
  {
    id: 5,
    name: "Helen Marie Johnson",
    birthDate: "April 3, 1930",
    deathDate: "July 19, 2023",
    year: 2023,
    image: "/images/memorial-1.jpg",
    description: "A pillar of strength and grace who raised five children with unwavering love and dedication.",
    tributes: 234,
    photos: 189,
    location: "New York, NY",
    tags: ["Mother", "Grandmother"],
  },
  {
    id: 6,
    name: "William Henry Adams",
    birthDate: "December 8, 1945",
    deathDate: "February 28, 2023",
    year: 2023,
    image: "/images/memorial-2.jpg",
    description: "A passionate musician and loving father whose melodies brought joy to countless hearts.",
    tributes: 178,
    photos: 267,
    location: "Nashville, TN",
    tags: ["Father", "Musician"],
  },
  {
    id: 7,
    name: "Sarah Elizabeth Wong",
    birthDate: "July 15, 1968",
    deathDate: "September 5, 2023",
    year: 2023,
    image: "/images/memorial-3.jpg",
    description: "A brilliant doctor who dedicated her career to healing others and mentoring the next generation.",
    tributes: 312,
    photos: 145,
    location: "Seattle, WA",
    tags: ["Doctor", "Mother"],
  },
  {
    id: 8,
    name: "James Patrick O'Brien",
    birthDate: "March 21, 1952",
    deathDate: "December 12, 2022",
    year: 2022,
    image: "/images/memorial-4.jpg",
    description: "A retired firefighter who spent his life serving and protecting his community with courage.",
    tributes: 445,
    photos: 398,
    location: "Philadelphia, PA",
    tags: ["Father", "Hero"],
  },
]

// Pet memorials data
const petMemorials = [
  {
    id: 101,
    name: "Max",
    birthDate: "May 2012",
    deathDate: "March 2024",
    year: 2024,
    image: "/images/pet-1.jpg",
    description: "The most loyal golden retriever who brought endless joy and unconditional love to our family for 12 wonderful years.",
    tributes: 34,
    photos: 156,
    location: "Denver, CO",
    tags: ["Dog", "Golden Retriever"],
  },
  {
    id: 102,
    name: "Whiskers",
    birthDate: "August 2008",
    deathDate: "June 2024",
    year: 2024,
    image: "/images/pet-2.jpg",
    description: "A gentle soul with the softest purr who was our constant companion through life's ups and downs.",
    tributes: 28,
    photos: 89,
    location: "Portland, OR",
    tags: ["Cat", "Tabby"],
  },
  {
    id: 103,
    name: "Buddy",
    birthDate: "January 2010",
    deathDate: "November 2023",
    year: 2023,
    image: "/images/pet-3.jpg",
    description: "Our sweet labrador who never met a stranger and made every day brighter with his wagging tail.",
    tributes: 56,
    photos: 234,
    location: "Miami, FL",
    tags: ["Dog", "Labrador"],
  },
  {
    id: 104,
    name: "Luna",
    birthDate: "April 2015",
    deathDate: "August 2024",
    year: 2024,
    image: "/images/pet-4.jpg",
    description: "Our elegant princess who ruled our hearts with grace and demanded the finest chin scratches.",
    tributes: 42,
    photos: 178,
    location: "Los Angeles, CA",
    tags: ["Cat", "Persian"],
  },
  {
    id: 105,
    name: "Rocky",
    birthDate: "June 2011",
    deathDate: "January 2024",
    year: 2024,
    image: "/images/pet-1.jpg",
    description: "A brave and protective companion who watched over our family with dedication and love.",
    tributes: 67,
    photos: 203,
    location: "Phoenix, AZ",
    tags: ["Dog", "German Shepherd"],
  },
  {
    id: 106,
    name: "Mittens",
    birthDate: "September 2013",
    deathDate: "April 2023",
    year: 2023,
    image: "/images/pet-2.jpg",
    description: "The gentlest cat who loved nothing more than curling up in a warm lap and purring the day away.",
    tributes: 31,
    photos: 112,
    location: "Minneapolis, MN",
    tags: ["Cat", "Calico"],
  },
  {
    id: 107,
    name: "Duke",
    birthDate: "March 2009",
    deathDate: "October 2022",
    year: 2022,
    image: "/images/pet-3.jpg",
    description: "Our majestic boy who loved long walks, belly rubs, and stealing socks from the laundry.",
    tributes: 89,
    photos: 267,
    location: "Atlanta, GA",
    tags: ["Dog", "Labrador"],
  },
  {
    id: 108,
    name: "Shadow",
    birthDate: "November 2010",
    deathDate: "December 2023",
    year: 2023,
    image: "/images/pet-4.jpg",
    description: "A mysterious and loving soul who chose us and made our house a home.",
    tributes: 45,
    photos: 134,
    location: "San Diego, CA",
    tags: ["Cat", "Black Cat"],
  },
]

const locations = ["All Locations", "Boston, MA", "Chicago, IL", "San Francisco, CA", "Austin, TX", "New York, NY", "Nashville, TN", "Seattle, WA", "Philadelphia, PA", "Denver, CO", "Portland, OR", "Miami, FL", "Los Angeles, CA", "Phoenix, AZ", "Minneapolis, MN", "Atlanta, GA", "San Diego, CA"]
const years = ["All Years", "2024", "2023", "2022"]
const tags = ["All Tags", "Mother", "Father", "Grandmother", "Teacher", "Veteran", "Doctor", "Musician", "Hero", "Son", "Brother", "Dog", "Cat", "Golden Retriever", "Labrador", "Tabby", "Persian", "Calico", "Black Cat", "German Shepherd"]

type SortOption = "recent" | "updated" | "az"

export default function MemorialsPage() {
  const [activeTab, setActiveTab] = useState<"human" | "pet">("human")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedYear, setSelectedYear] = useState("All Years")
  const [selectedTag, setSelectedTag] = useState("All Tags")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [visibleCount, setVisibleCount] = useState(8)

  const currentMemorials = activeTab === "human" ? humanMemorials : petMemorials

  const filteredMemorials = useMemo(() => {
    let result = [...currentMemorials]

    // Search filter
    if (searchQuery) {
      result = result.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Location filter
    if (selectedLocation !== "All Locations") {
      result = result.filter((m) => m.location === selectedLocation)
    }

    // Year filter
    if (selectedYear !== "All Years") {
      result = result.filter((m) => m.year === parseInt(selectedYear))
    }

    // Tag filter
    if (selectedTag !== "All Tags") {
      result = result.filter((m) => m.tags.includes(selectedTag))
    }

    // Sort
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => b.year - a.year)
        break
      case "updated":
        result.sort((a, b) => b.tributes - a.tributes)
        break
      case "az":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [currentMemorials, searchQuery, selectedLocation, selectedYear, selectedTag, sortBy])

  const visibleMemorials = filteredMemorials.slice(0, visibleCount)
  const hasMore = visibleCount < filteredMemorials.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8)
  }

  const handleTabChange = (tab: "human" | "pet") => {
    setActiveTab(tab)
    setVisibleCount(8)
    setSearchQuery("")
    setSelectedLocation("All Locations")
    setSelectedYear("All Years")
    setSelectedTag("All Tags")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#faf9f7] to-background">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <p className="text-[#e07a3f] tracking-[0.2em] text-xs uppercase mb-4 font-medium">
            Honoring Those We Love
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#3a3a3a] mb-4 text-balance">
            Browse Memorials
          </h1>
          <p className="text-[#6a6a6a] text-lg md:text-xl max-w-2xl mx-auto">
            Discover beautiful tributes for humans and pets
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-[#f5f3f0] rounded-full p-1.5">
              <button
                onClick={() => handleTabChange("human")}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "human"
                    ? "bg-white text-[#3a3a3a] shadow-sm"
                    : "text-[#6a6a6a] hover:text-[#3a3a3a]"
                }`}
              >
                Human Memorials
              </button>
              <button
                onClick={() => handleTabChange("pet")}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "pet"
                    ? "bg-white text-[#3a3a3a] shadow-sm"
                    : "text-[#6a6a6a] hover:text-[#3a3a3a]"
                }`}
              >
                Pet Memorials
              </button>
            </div>
          </div>

          {/* Sticky Search & Filter Bar */}
          <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-[#e8e6e3]/50 p-4 md:p-6 mb-10">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a8a]" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-[#faf9f7] border-[#e8e6e3] rounded-xl text-[#3a3a3a] placeholder:text-[#8a8a8a] focus-visible:ring-[#e07a3f]"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Location Filter */}
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full sm:w-[160px] h-12 bg-[#faf9f7] border-[#e8e6e3] rounded-xl">
                    <MapPin className="w-4 h-4 mr-2 text-[#8a8a8a]" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Filter */}
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full sm:w-[140px] h-12 bg-[#faf9f7] border-[#e8e6e3] rounded-xl">
                    <Calendar className="w-4 h-4 mr-2 text-[#8a8a8a]" />
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tag Filter */}
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-full sm:w-[140px] h-12 bg-[#faf9f7] border-[#e8e6e3] rounded-xl">
                    <Tag className="w-4 h-4 mr-2 text-[#8a8a8a]" />
                    <SelectValue placeholder="Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-full sm:w-[180px] h-12 bg-[#faf9f7] border-[#e8e6e3] rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="updated">Most Tributes</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-[#8a8a8a] text-sm mb-6">
            Showing {visibleMemorials.length} of {filteredMemorials.length} memorials
          </p>

          {/* Memorials Grid */}
          {visibleMemorials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleMemorials.map((memorial) => (
                <article
                  key={memorial.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-[#e8e6e3]/50 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={memorial.image}
                      alt={memorial.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-serif text-lg text-[#3a3a3a] mb-1 group-hover:text-[#e07a3f] transition-colors duration-300 truncate">
                      {memorial.name}
                    </h3>
                    <p className="text-xs text-[#8a8a8a] mb-3">
                      {memorial.birthDate} — {memorial.deathDate}
                    </p>
                    <p className="text-[#6a6a6a] text-sm leading-relaxed line-clamp-2 mb-4">
                      {memorial.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-[#f0eeeb]">
                      <div className="flex items-center gap-1.5 text-[#8a8a8a]">
                        <Heart size={14} className="text-[#e07a3f]" />
                        <span className="text-xs">{memorial.tributes} tributes</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#8a8a8a]">
                        <ImageIcon size={14} className="text-[#e07a3f]" />
                        <span className="text-xs">{memorial.photos} photos</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#8a8a8a] text-lg">No memorials found matching your search.</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedLocation("All Locations")
                  setSelectedYear("All Years")
                  setSelectedTag("All Tags")
                }}
                className="mt-4 text-[#e07a3f] hover:text-[#d96c2f]"
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="px-8 py-6 rounded-full border-[#e07a3f] text-[#e07a3f] hover:bg-[#e07a3f] hover:text-white transition-all duration-300"
              >
                Load More Memorials
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
