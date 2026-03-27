import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  LayoutDashboard, CreditCard, FileText, LogOut, 
  DollarSign, Clock, CheckCircle2, Send, Car,
  ChevronDown, RotateCcw, Loader2, Eye, Users, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_instant-roadtax/artifacts/kuquahg0_insta%20logo.jpg";

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => (
  <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 hidden md:block">
    <Link to="/" className="flex items-center gap-2 mb-8 px-4">
      <img src={LOGO_URL} alt="InstaRoadTax" className="w-10 h-10 rounded-lg" />
      <span className="text-lg font-bold text-indigo-600">Admin Panel</span>
    </Link>
    
    <nav className="space-y-2">
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`sidebar-link w-full ${activeTab === "dashboard" ? "active" : ""}`}
        data-testid="nav-dashboard"
      >
        <LayoutDashboard className="w-5 h-5" />
        Dashboard
      </button>
      <button
        onClick={() => setActiveTab("inquiries")}
        className={`sidebar-link w-full ${activeTab === "inquiries" ? "active" : ""}`}
        data-testid="nav-inquiries"
      >
        <FileText className="w-5 h-5" />
        Inquiries
      </button>
      <button
        onClick={() => setActiveTab("payments")}
        className={`sidebar-link w-full ${activeTab === "payments" ? "active" : ""}`}
        data-testid="nav-payments"
      >
        <CreditCard className="w-5 h-5" />
        Payments
      </button>
    </nav>
    
    <div className="absolute bottom-4 left-4 right-4">
      <button
        onClick={onLogout}
        className="sidebar-link w-full text-red-500 hover:bg-red-50"
        data-testid="btn-logout"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  </div>
);

const MobileHeader = ({ activeTab, setActiveTab, onLogout }) => (
  <div className="md:hidden bg-white border-b border-gray-200 p-4">
    <div className="flex items-center justify-between mb-4">
      <Link to="/" className="flex items-center gap-2">
        <img src={LOGO_URL} alt="InstaRoadTax" className="w-8 h-8 rounded-lg" />
        <span className="text-lg font-bold text-indigo-600">Admin</span>
      </Link>
      <button onClick={onLogout} className="text-red-500">
        <LogOut className="w-5 h-5" />
      </button>
    </div>
    <div className="flex gap-2">
      {["dashboard", "inquiries", "payments"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg text-sm capitalize ${
            activeTab === tab 
              ? "bg-indigo-500 text-white" 
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtitle, color = "indigo" }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusClasses = {
    new: "status-new",
    processing: "status-processing",
    quoted: "status-quoted",
    paid: "status-paid",
    completed: "status-completed",
    cancelled: "status-cancelled",
    pending: "status-pending",
    failed: "status-failed",
    refunded: "status-refunded"
  };
  
  return (
    <span className={`status-badge ${statusClasses[status] || "status-pending"}`}>
      {status}
    </span>
  );
};

const DashboardTab = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div data-testid="dashboard-tab">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Users} 
          title="Total Inquiries" 
          value={stats.total_inquiries || 0}
          color="blue"
        />
        <StatCard 
          icon={Clock} 
          title="New Inquiries" 
          value={stats.new_inquiries || 0}
          color="amber"
        />
        <StatCard 
          icon={MessageSquare} 
          title="Quoted" 
          value={stats.quoted_inquiries || 0}
          color="green"
        />
        <StatCard 
          icon={DollarSign} 
          title="Total Revenue" 
          value={`RM ${(stats.total_revenue || 0).toFixed(2)}`}
          color="emerald"
        />
      </div>
    </div>
  );
};

const QuotationDialog = ({ inquiry, open, onClose, onSubmit }) => {
  const [quotation, setQuotation] = useState({
    insurance_provider: "",
    coverage_type: "comprehensive",
    sum_insured: "",
    premium_amount: "",
    road_tax_amount: "",
    total_amount: "",
    valid_until: "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Auto-calculate total when premium or road tax changes
    const premium = parseFloat(quotation.premium_amount) || 0;
    const roadTax = parseFloat(quotation.road_tax_amount) || 0;
    setQuotation(prev => ({ ...prev, total_amount: (premium + roadTax).toFixed(2) }));
  }, [quotation.premium_amount, quotation.road_tax_amount]);
  
  const handleSubmit = async () => {
    if (!quotation.insurance_provider || !quotation.sum_insured || !quotation.premium_amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({
        ...quotation,
        inquiry_id: inquiry.id,
        sum_insured: parseFloat(quotation.sum_insured),
        premium_amount: parseFloat(quotation.premium_amount),
        road_tax_amount: parseFloat(quotation.road_tax_amount) || 0,
        total_amount: parseFloat(quotation.total_amount)
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };
  
  if (!inquiry) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Quotation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Vehicle: <span className="text-gray-900 font-medium">{inquiry.vehicle_info?.vehicle_number}</span></p>
            <p className="text-sm text-gray-500">Customer: <span className="text-gray-900 font-medium">{inquiry.customer_info?.email}</span></p>
          </div>
          
          <div>
            <Label className="text-gray-700">Insurance Provider *</Label>
            <Input
              placeholder="e.g., Etiqa, Allianz, Zurich"
              value={quotation.insurance_provider}
              onChange={(e) => setQuotation({ ...quotation, insurance_provider: e.target.value })}
              className="input-light mt-1"
            />
          </div>
          
          <div>
            <Label className="text-gray-700">Coverage Type *</Label>
            <Select
              value={quotation.coverage_type}
              onValueChange={(value) => setQuotation({ ...quotation, coverage_type: value })}
            >
              <SelectTrigger className="input-light mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="third_party_fire_theft">Third Party, Fire & Theft</SelectItem>
                <SelectItem value="third_party">Third Party Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-gray-700">Sum Insured (RM) *</Label>
            <Input
              type="number"
              placeholder="e.g., 50000"
              value={quotation.sum_insured}
              onChange={(e) => setQuotation({ ...quotation, sum_insured: e.target.value })}
              className="input-light mt-1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700">Premium (RM) *</Label>
              <Input
                type="number"
                placeholder="e.g., 800"
                value={quotation.premium_amount}
                onChange={(e) => setQuotation({ ...quotation, premium_amount: e.target.value })}
                className="input-light mt-1"
              />
            </div>
            <div>
              <Label className="text-gray-700">Road Tax (RM)</Label>
              <Input
                type="number"
                placeholder="e.g., 150"
                value={quotation.road_tax_amount}
                onChange={(e) => setQuotation({ ...quotation, road_tax_amount: e.target.value })}
                className="input-light mt-1"
              />
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-amber-700 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-amber-600">RM {quotation.total_amount || "0.00"}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-700">Valid Until</Label>
            <Input
              type="date"
              value={quotation.valid_until}
              onChange={(e) => setQuotation({ ...quotation, valid_until: e.target.value })}
              className="input-light mt-1"
            />
          </div>
          
          <div>
            <Label className="text-gray-700">Remarks (Optional)</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={quotation.remarks}
              onChange={(e) => setQuotation({ ...quotation, remarks: e.target.value })}
              className="input-light mt-1"
              rows={2}
            />
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Quotation
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InquiriesTab = ({ inquiries, loading, onRefresh, onSendQuotation }) => {
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  
  const handleSendQuotation = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowQuotationDialog(true);
  };
  
  return (
    <div data-testid="inquiries-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Inquiries</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="border-gray-300"
          data-testid="btn-refresh-inquiries"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No inquiries found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Table className="table-light">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id} data-testid={`inquiry-row-${inquiry.id}`}>
                  <TableCell className="font-mono text-sm">{inquiry.id?.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell className="font-medium">{inquiry.vehicle_info?.vehicle_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-gray-900">{inquiry.customer_info?.phone}</p>
                      <p className="text-gray-400 text-xs">{inquiry.customer_info?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{inquiry.insurance_type}</TableCell>
                  <TableCell><StatusBadge status={inquiry.status} /></TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          Actions
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem data-testid={`view-inquiry-${inquiry.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {inquiry.status === "new" || inquiry.status === "processing" ? (
                          <DropdownMenuItem 
                            onClick={() => handleSendQuotation(inquiry)}
                            className="text-amber-600"
                            data-testid={`send-quotation-${inquiry.id}`}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Quotation
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <QuotationDialog
        inquiry={selectedInquiry}
        open={showQuotationDialog}
        onClose={() => setShowQuotationDialog(false)}
        onSubmit={onSendQuotation}
      />
    </div>
  );
};

const PaymentsTab = ({ payments, loading, onRefresh, onRefund }) => (
  <div data-testid="payments-tab">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="border-gray-300"
        data-testid="btn-refresh-payments"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>
    
    {loading ? (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    ) : payments.length === 0 ? (
      <div className="text-center py-12 text-gray-400">
        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No payments found</p>
      </div>
    ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table className="table-light">
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                <TableCell className="font-mono text-sm">{payment.id?.slice(0, 8)}...</TableCell>
                <TableCell className="font-mono text-sm">{payment.transaction_id || "-"}</TableCell>
                <TableCell className="text-green-600 font-semibold">RM {payment.amount?.toFixed(2)}</TableCell>
                <TableCell><StatusBadge status={payment.status} /></TableCell>
                <TableCell className="text-gray-400">
                  {new Date(payment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        Actions
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {payment.status === "paid" && (
                        <DropdownMenuItem 
                          onClick={() => onRefund(payment.id)}
                          className="text-red-600"
                          data-testid={`btn-refund-${payment.id}`}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Refund
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [inquiries, setInquiries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const isAuth = sessionStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin");
      return;
    }
    
    fetchData();
  }, [navigate]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, inquiriesRes, paymentsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/inquiries`),
        axios.get(`${API}/payments`)
      ]);
      
      setStats(statsRes.data);
      setInquiries(inquiriesRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    toast.success("Logged out successfully");
    navigate("/admin");
  };
  
  const handleSendQuotation = async (quotationData) => {
    try {
      await axios.post(`${API}/inquiries/${quotationData.inquiry_id}/quotation`, quotationData);
      toast.success("Quotation sent successfully!");
      fetchData();
    } catch (error) {
      console.error("Error sending quotation:", error);
      toast.error(error.response?.data?.detail || "Failed to send quotation");
    }
  };
  
  const handleRefund = async (paymentId) => {
    try {
      await axios.post(`${API}/payments/${paymentId}/refund`);
      toast.success("Payment refunded successfully");
      fetchData();
    } catch (error) {
      console.error("Refund error:", error);
      toast.error(error.response?.data?.detail || "Failed to refund payment");
    }
  };
  
  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab stats={stats} loading={loading} />;
      case "inquiries":
        return (
          <InquiriesTab 
            inquiries={inquiries} 
            loading={loading} 
            onRefresh={fetchData}
            onSendQuotation={handleSendQuotation}
          />
        );
      case "payments":
        return (
          <PaymentsTab 
            payments={payments} 
            loading={loading} 
            onRefresh={fetchData}
            onRefund={handleRefund}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
        />
        
        <div className="flex-1">
          <MobileHeader 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
          
          <main className="p-6 md:p-8">
            {renderTab()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
