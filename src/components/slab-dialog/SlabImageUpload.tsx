
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SlabImageUploadProps {
  formData: {
    image_url: string;
  };
  onFormDataChange: (updates: Partial<typeof formData>) => void;
}

const SlabImageUpload = ({ formData, onFormDataChange }: SlabImageUploadProps) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `slab-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slab-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('slab-images')
        .getPublicUrl(filePath);

      onFormDataChange({ image_url: publicUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
      <h4 className="font-medium text-slate-800 flex items-center space-x-2">
        <Image className="h-4 w-4" />
        <span>Slab Image</span>
      </h4>

      <div className="space-y-2">
        <Label htmlFor="image-upload">Upload Image</Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploadingImage}
        />
        <p className="text-xs text-slate-500">Upload an image file to display in the application</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Or Image URL</Label>
        <Input
          id="image_url"
          placeholder="https://example.com/image.jpg"
          value={formData.image_url}
          onChange={(e) => onFormDataChange({ image_url: e.target.value })}
          disabled={isUploadingImage}
        />
        <p className="text-xs text-slate-500">Direct URL to an image for display</p>
      </div>

      {formData.image_url && (
        <div className="mt-2">
          <img
            src={formData.image_url}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SlabImageUpload;
