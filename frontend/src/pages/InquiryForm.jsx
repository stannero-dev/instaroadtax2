import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Car, Bike, User, UploadCloud, ChevronLeft, ChevronRight, CheckCircle2, FileText, X, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API } from "@/lib/api";
import axios from "axios";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_instant-roadtax/artifacts/kuquahg0_insta%20logo.jpg";

const steps = [
  { id: 1, title: "Insurance Type", icon: Car },
  { id: 2, title: "Vehicle Details", icon: FileText },
  { id: 3, title: "Documents", icon: UploadCloud },
  { id: 4, title: "Review", icon: CheckCircle2 }
];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
    {steps.map((step, index) => (
      <div key={step.id} className="flex items-center">
        <div className="flex flex-col items-center">
          <div 
            className={`step-indicator ${
              currentStep > step.id ? 'completed' : 
              currentStep === step.id ? 'active' : 'pending'
            }`}
            data-testid={`step-indicator-${step.id}`}
          >
            {currentStep > step.id ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          <span className={`text-xs mt-2 hidden md:block ${
            currentStep >= step.id ? 'text-amber-600' : 'text-gray-400'
          }`}>
            {step.title}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-8 md:w-16 h-0.5 mx-2 ${
            currentStep > step.id ? 'bg-amber-500' : 'bg-gray-200'
          }`} />
        )}
      </div>
    ))}
  </div>
);

const InsuranceTypeStep = ({ formData, setFormData }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of insurance do you need?</h2>
      <p className="text-gray-500">Select the insurance category that best fits your needs</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto">
      <button
        type="button"
        onClick={() => setFormData({ ...formData, insurance_type: 'car' })}
        className={`insurance-type-card ${formData.insurance_type === 'car' ? 'selected' : ''}`}
        data-testid="select-car-insurance"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Car</h3>
          <p className="text-gray-500 text-sm mt-1">Comprehensive car insurance</p>
          {formData.insurance_type === 'car' && (
            <span className="mt-3 text-xs font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">Selected</span>
          )}
        </div>
      </button>
      
      <button
        type="button"
        onClick={() => setFormData({ ...formData, insurance_type: 'motorcycle' })}
        className={`insurance-type-card ${formData.insurance_type === 'motorcycle' ? 'selected' : ''}`}
        data-testid="select-motorcycle-insurance"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Bike className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Motorcycle</h3>
          <p className="text-gray-500 text-sm mt-1">Protection for your motorcycle</p>
          {formData.insurance_type === 'motorcycle' && (
            <span className="mt-3 text-xs font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">Selected</span>
          )}
        </div>
      </button>
    </div>
  </div>
);

const VehicleDetailsStep = ({ formData, setFormData }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {formData.insurance_type === 'car' ? 'Car' : 'Motorcycle'} Insurance Details
      </h2>
      <p className="text-gray-500">Fill in your vehicle and contact information</p>
    </div>
    
    <div>
      <Label className="text-gray-700 mb-3 block">Vehicle registered under</Label>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, ownership_type: 'personal' })}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            formData.ownership_type === 'personal' 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          data-testid="select-personal"
        >
          <div className="flex items-center justify-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Personal</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, ownership_type: 'company' })}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            formData.ownership_type === 'company' 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          data-testid="select-company"
        >
          <div className="flex items-center justify-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Company</span>
          </div>
        </button>
      </div>
    </div>
    
    <div>
      <Label htmlFor="vehicle_number" className="text-gray-700">Vehicle Registration Number (Plate Number) *</Label>
      <Input
        id="vehicle_number"
        placeholder="e.g., WXY 1234"
        value={formData.vehicle_number}
        onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
        className="input-light mt-2"
        data-testid="input-vehicle-number"
      />
    </div>
    
    <div>
      <Label htmlFor="postcode" className="text-gray-700">Postcode (Vehicle Location) *</Label>
      <Input
        id="postcode"
        placeholder="e.g., 50000"
        value={formData.postcode}
        onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
        className="input-light mt-2"
        data-testid="input-postcode"
      />
    </div>
    
    <div>
      <Label htmlFor="nric_number" className="text-gray-700">NRIC Number *</Label>
      <Input
        id="nric_number"
        placeholder="e.g., 901234-01-1234"
        value={formData.nric_number}
        onChange={(e) => setFormData({ ...formData, nric_number: e.target.value })}
        className="input-light mt-2"
        data-testid="input-nric"
      />
    </div>
    
    <div>
      <Label htmlFor="phone" className="text-gray-700">Contact Number *</Label>
      <Input
        id="phone"
        placeholder="e.g., 012-345 6789"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="input-light mt-2"
        data-testid="input-phone"
      />
    </div>
    
    <div>
      <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
      <Input
        id="email"
        type="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="input-light mt-2"
        data-testid="input-email"
      />
    </div>
  </div>
);

const DocumentsStep = ({ formData, setFormData }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const uploadedDocs = [...formData.uploaded_documents];
    
    for (const file of files) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        
        const response = await axios.post(`${API}/upload`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (response.data.success) {
          uploadedDocs.push({
            file_id: response.data.file_id,
            file_name: response.data.file_name,
            original_name: response.data.original_name
          });
          toast.success(`${file.name} uploaded successfully`);
        }
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setFormData({ ...formData, uploaded_documents: uploadedDocs });
    setUploading(false);
  };
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [formData]);
  
  const removeDocument = (index) => {
    const newDocs = formData.uploaded_documents.filter((_, i) => i !== index);
    setFormData({ ...formData, uploaded_documents: newDocs });
  };
  
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h2>
        <p className="text-gray-500">Optional: Upload documents for faster processing</p>
      </div>
      
      <div
        className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        data-testid="file-upload-zone"
      >
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="file-input"
          disabled={uploading}
        />
        <label htmlFor="file-input" className="cursor-pointer">
          {uploading ? (
            <Loader2 className="w-12 h-12 mx-auto text-amber-500 animate-spin" />
          ) : (
            <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
          )}
          <p className="text-gray-600 mt-4">
            {uploading ? "Uploading..." : "Drag & drop files here or click to browse"}
          </p>
          <p className="text-gray-400 text-sm mt-2">PDF, JPG, PNG, DOC (Max 10MB)</p>
        </label>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-indigo-800 text-sm font-medium mb-2">Recommended documents:</p>
        <ul className="text-indigo-700 text-sm space-y-1">
          <li className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Car Grant (Geran Kenderaan)
          </li>
          <li className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> MyKad / IC Copy (Front & Back)
          </li>
          <li className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Previous Insurance Policy
          </li>
        </ul>
      </div>
      
      {formData.uploaded_documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-700 font-medium">Uploaded Documents:</p>
          {formData.uploaded_documents.map((doc, index) => (
            <div 
              key={index}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
              data-testid={`uploaded-doc-${index}`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-500" />
                <span className="text-gray-700 text-sm truncate max-w-[200px]">{doc.original_name}</span>
              </div>
              <button 
                onClick={() => removeDocument(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                data-testid={`remove-doc-${index}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div>
        <Label htmlFor="notes" className="text-gray-700">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or additional information..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input-light mt-2"
          rows={3}
          data-testid="input-notes"
        />
      </div>
    </div>
  );
};

const ReviewStep = ({ formData }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Inquiry</h2>
      <p className="text-gray-500">Please confirm your details before submitting</p>
    </div>
    
    <div className="card-white rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {formData.insurance_type === 'car' ? <Car className="w-5 h-5 text-amber-500" /> : <Bike className="w-5 h-5 text-amber-500" />}
        {formData.insurance_type === 'car' ? 'Car' : 'Motorcycle'} Insurance
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Vehicle Number</p>
          <p className="text-gray-900 font-medium">{formData.vehicle_number || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500">Ownership</p>
          <p className="text-gray-900 font-medium capitalize">{formData.ownership_type || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500">Postcode</p>
          <p className="text-gray-900 font-medium">{formData.postcode || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500">NRIC</p>
          <p className="text-gray-900 font-medium">{formData.nric_number || "-"}</p>
        </div>
      </div>
    </div>
    
    <div className="card-white rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-amber-500" />
        Contact Information
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Phone</p>
          <p className="text-gray-900 font-medium">{formData.phone || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="text-gray-900 font-medium">{formData.email || "-"}</p>
        </div>
      </div>
    </div>
    
    <div className="card-white rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-amber-500" />
        Documents ({formData.uploaded_documents.length})
      </h3>
      {formData.uploaded_documents.length > 0 ? (
        <ul className="space-y-2">
          {formData.uploaded_documents.map((doc, index) => (
            <li key={index} className="text-gray-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {doc.original_name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm">No documents uploaded</p>
      )}
    </div>
    
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-indigo-800 font-medium">What happens next?</p>
          <p className="text-indigo-700 text-sm mt-1">
            After you submit, our team will review your inquiry and send you a quotation via email and WhatsApp within 1-2 hours during business hours.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const InquiryForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState(null);
  
  const [formData, setFormData] = useState({
    insurance_type: "car",
    ownership_type: "personal",
    vehicle_number: "",
    postcode: "",
    nric_number: "",
    phone: "",
    email: "",
    uploaded_documents: [],
    notes: ""
  });
  
  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.insurance_type) {
        toast.error("Please select an insurance type");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.vehicle_number || !formData.postcode || !formData.nric_number || !formData.phone || !formData.email) {
        toast.error("Please fill in all required fields");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }
    return true;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const inquiryData = {
        insurance_type: formData.insurance_type,
        vehicle_info: {
          vehicle_number: formData.vehicle_number,
          ownership_type: formData.ownership_type,
          postcode: formData.postcode
        },
        customer_info: {
          nric_number: formData.nric_number,
          phone: formData.phone,
          email: formData.email
        },
        uploaded_documents: formData.uploaded_documents.map(doc => doc.file_name),
        notes: formData.notes || null
      };
      
      const response = await axios.post(`${API}/inquiries/create`, inquiryData);
      
      if (response.data.success) {
        setInquiryId(response.data.inquiry_id);
        setSubmitted(true);
        toast.success("Inquiry submitted successfully!");
      }
    } catch (error) {
      console.error("Error creating inquiry:", error);
      toast.error(error.response?.data?.detail || "Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" data-testid="inquiry-success">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your inquiry. Our team will review your request and send you a quotation via email and WhatsApp within 1-2 hours during business hours.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-500 text-sm mb-1">Your Inquiry ID</p>
              <p className="text-gray-900 font-mono font-semibold">{inquiryId}</p>
              <p className="text-gray-400 text-xs mt-1">Save this ID to check your status later</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link to={`/check-status?inquiryId=${encodeURIComponent(inquiryId)}`} className="w-full">
                <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white" data-testid="btn-check-status">
                  Check Status
                </Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full border-gray-300" data-testid="btn-back-home">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <InsuranceTypeStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <VehicleDetailsStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <DocumentsStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="inquiry-form-page">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <StepIndicator currentStep={currentStep} />
          
          <div className="min-h-[400px]">
            {renderStep()}
          </div>
          
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-gray-300 text-gray-600"
              data-testid="btn-back"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                data-testid="btn-next"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
                data-testid="btn-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Get My Quote
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
