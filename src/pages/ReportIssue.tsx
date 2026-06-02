import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { complaintService } from "@/services/complaintService";
import { ComplaintCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, MapPin } from "lucide-react";

const categories: { value: ComplaintCategory; label: string }[] = [
  { value: "road", label: "Road" },
  { value: "garbage", label: "Garbage" },
  { value: "water", label: "Water Supply" },
  { value: "drainage", label: "Drainage" },
  { value: "streetlight", label: "Streetlight" },
  { value: "illegal-dumping", label: "Illegal Dumping" },
];

const ReportIssue = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [address, setAddress] = useState("New Delhi, India");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.209);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        toast({ title: "Image uploaded", description: "Image has been selected" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!user || !user.id) {
      toast({ title: "Error", description: "You must be logged in to submit a complaint", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const created = await complaintService.createComplaint({
        title: title.trim(),
        description: description.trim(),
        category: category as ComplaintCategory,
        location: { lat, lng, address },
        citizenId: user.id,
        image: image || undefined,
      });
      toast({
        title: "✅ Complaint Submitted!",
        description: `Your complaint has been registered. Your Complaint ID is: ${created.complaintId || created.id}. Use this to track your issue.`,
      });

      setTitle("");
      setDescription("");
      setCategory("");
      setAddress("New Delhi, India");
      setImage(null);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({ title: "Submission failed", description: error.response?.data?.message || error.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="shadow-xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl">Report a Civic Issue</CardTitle>
          <CardDescription>Fill in the details about the issue in your area</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief issue title" required maxLength={100} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail" required maxLength={1000} rows={4} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ComplaintCategory)}>
                <SelectTrigger className="bg-popover"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Upload Image (optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground cursor-pointer hover:border-saffron transition-colors"
              >
                {image ? (
                  <>
                    <img src={image} alt="Uploaded" className="h-32 w-32 mx-auto mb-2 rounded object-cover" />
                    <p className="text-sm text-saffron font-medium">Image selected ✓</p>
                    <p className="text-xs">Click to change image</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Click or drag to upload an image</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address (e.g., New Delhi, India)"
              />
            </div>
            <Button type="submit" className="w-full bg-saffron text-saffron-foreground hover:bg-saffron/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Complaint
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIssue;
