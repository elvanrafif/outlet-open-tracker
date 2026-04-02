import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const ProjectDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-6 p-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Detail Project #{id}</h1>
      </div>
      
      <div className="rounded-lg border border-dashed p-20 text-center">
        Checklist 33 Task akan muncul di sini.
      </div>
    </div>
  );
};
