import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  TrendingUp,
  HandCoins,
  CalendarRange,
  Search,
  ShieldAlert,
  BadgeHelp,
  CheckCircle2,
  Trash2,
  FileDown,
  RefreshCw,
  Sliders,
  PlayCircle,
  Lock,
  Save,
  Mail,
  MessageCircle,
  BarChart3,
  Send,
  CalendarDays,
  UploadCloud,
  Download,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  User,
  Lead,
  Appointment,
  QuoteRequest,
  Quote,
  ActivityLog,
  SystemSettings,
  Message,
  Conversation,
} from "../types";
import { clientDb } from "../clientDb";
import { getDepartment } from "../departments";
import { apiGetUsers, apiGetUsersByRole } from "../api/auth";
import type { ApiUser } from "../api/auth";
import {
  apiGetDemandes,
  apiGetDevis,
  apiUpdateDemande,
  apiCreateDevis,
  apiUpdateDevis,
} from "../api/quotes";
import {
  apiGetMessages,
  apiGetMessagesByClient,
  apiCreateMessage,
  ApiMessage,
} from "../api/messages";
import {
  apiGetLeads,
  apiUpdateLead,
  apiDeleteLead,
} from "../api/leads";
import { apiGetAllAppointments, apiUpdateAppointmentStatus } from "../api/appointments";
import { apiDownloadDocument, apiGetDocuments, apiUploadDocumentForClient, type ApiDocument } from "../api/documents";
import { useLanguage } from "../LanguageContext";

interface AdminViewProps {
  currentUser: User;
  token: string;
}

export default function AdminView({ currentUser, token }: AdminViewProps) {
  const { language, t } = useLanguage();
  const [adminSubTab, setAdminSubTab] = useState<
    "dashboard" | "crm" | "quotes" | "documents" | "appointments" | "messaging" | "settings" | "logs"
  >("dashboard");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [adminManagers, setAdminManagers] = useState<ApiUser[]>([]);
  const [showArchivedRequests, setShowArchivedRequests] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsError, setAnalyticsError] = useState("");

  const [leadSearch, setLeadSearch] = useState("");
  const [leadDeptFilter, setLeadDeptFilter] = useState("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");

  const [selectedReq, setSelectedReq] = useState<QuoteRequest | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteTerms, setQuoteTerms] = useState(
    t(
      "Net 30. 40% upfront, 30% intermediate milestone, 30% delivery. Includes standard 6-month technical support warranty.",
      "Paiement net à 30 jours. 40 % d’avance, 30 % à l’étape intermédiaire et 30 % à la livraison. Comprend une garantie standard de support technique de 6 mois.",
    ),
  );
  const [isIssuingQuote, setIsIssuingQuote] = useState(false);

  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [leadNoteText, setLeadNoteText] = useState("");

  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [aptNoteText, setAptNoteText] = useState("");

  const [websiteName, setWebsiteName] = useState("");
  const [chatbotPrompt, setChatbotPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [emailTemplateQuote, setEmailTemplateQuote] = useState("");
  const [emailTemplateAppointment, setEmailTemplateAppointment] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [messagingError, setMessagingError] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [documentClients, setDocumentClients] = useState<ApiUser[]>([]);
  const [selectedDocumentClientId, setSelectedDocumentClientId] = useState("");
  const [selectedDocumentRequestId, setSelectedDocumentRequestId] = useState("");
  const [documentUploadFile, setDocumentUploadFile] = useState<File | null>(null);
  const [documentActionMessage, setDocumentActionMessage] = useState("");
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const documentUploadInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const apiLeadsRef = useRef<Lead[]>([]);

  useEffect(() => {
    fetchAdminData();
    fetchMessagingData();
    const interval = setInterval(fetchAdminData, 12000);
    const messagingInterval = setInterval(fetchMessagingData, 10000);
    return () => {
      clearInterval(interval);
      clearInterval(messagingInterval);
    };
  }, [token, language]);

  const fetchAdminData = async () => {
    const isApiSession = localStorage.getItem("ebi_auth_mode") === "api";
    let apiQuoteRequests: QuoteRequest[] | null = null;
    let apiQuoteData: Quote[] | null = null;
    let apiLeadsLoaded = false;

    // Try API for users / demandes / devis
    try {
      const demandes = await apiGetDemandes();
      const mapped: QuoteRequest[] = demandes.map((d) => ({
        id: d._id,
        userId: typeof d.client === 'string' ? d.client : d.client?._id || '',
        userEmail: typeof d.client === 'object' && d.client !== null ? d.client.email : undefined,
        clientName: typeof d.client === 'object' && d.client !== null ? d.client.fullname : t("Unknown client", "Client inconnu"),
        company: typeof d.client === 'object' && d.client !== null ? d.client.entreprise || '' : '',
        industry: d.secteur || '',
        projectType: d.service && typeof d.service === 'object' ? d.service.nom || '' : '',
        budget: d.budget || '',
        deadline: d.delai || '',
        requirements: d.besoin,
        status: mapStatut(d.statut),
        managerId: typeof d.manager === 'object' && d.manager !== null
          ? d.manager._id
          : typeof d.manager === 'string' ? d.manager : null,
        managerName: typeof d.manager === 'object' && d.manager !== null
          ? d.manager.fullname
          : undefined,
        archivedAt: d.archivedAt || null,
        createdAt: d.createdAt,
      }));
      apiQuoteRequests = mapped;
      setQuoteRequests(mapped);
    } catch (error) {
      if (localStorage.getItem("ebi_auth_mode") === "api") {
        console.error("Could not load quote requests from the API.", error);
        setQuoteRequests([]);
      }
    }

    try {
      const devisList = await apiGetDevis();
      const mapped: Quote[] = devisList.map((d: any) => ({
        id: d._id,
        quoteRequestId: typeof d.demande === 'object' ? d.demande._id : d.demande,
        clientName: '',
        projectName: `Devis ${d._id.slice(-6)}`,
        amount: d.montant,
        terms: '',
        expiryDate: '',
        status: mapDevisStatut(d.statut),
        createdAt: d.createdAt,
      }));
      apiQuoteData = mapped;
      setQuotes(mapped);
    } catch (error) {
      if (localStorage.getItem("ebi_auth_mode") === "api") {
        console.error("Could not load quotes from the API.", error);
        setQuotes([]);
      }
    }

    if (isApiSession) {
      try {
        const [apiDocuments, clients] = await Promise.all([
          apiGetDocuments(),
          apiGetUsersByRole("client"),
        ]);
        setDocuments(apiDocuments);
        setDocumentClients(clients);
        setSelectedDocumentClientId((current) => current || clients[0]?._id || "");
      } catch (error) {
        console.error("Could not load document exchange data.", error);
        setDocumentActionMessage(error instanceof Error ? error.message : t("Could not load documents.", "Impossible de charger les documents."));
      }

      try {
        setAdminManagers(await apiGetUsersByRole("admin"));
      } catch (error) {
        console.error("Could not load admin managers.", error);
        setAdminManagers([]);
      }
    }

    // Try backend for leads collected by the chatbot / contact form
    try {
      const apiLeads = await apiGetLeads();
      apiLeadsRef.current = apiLeads.map((l: any) => ({
        id: l._id,
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        country: l.country,
        projectDescription: l.projectDescription,
        budget: l.budget,
        deadline: l.deadline,
        status: l.status,
        suggestedDepartment: l.suggestedDepartment,
        priority: l.priority,
        conversationSummary: l.source ? `Source: ${l.source}` : undefined,
        notes: l.notes || "",
        createdAt: l.createdAt,
      }));
      apiLeadsLoaded = true;
    } catch (error) {
      console.error("Could not load leads for CRM analytics.", error);
      apiLeadsRef.current = [];
    }

    // Try clientDb for all data (fills gaps the API doesn't cover)
    try {
      const rLeads = clientDb.getLeads();
      const rApts = clientDb.getAppointments();
      const rReqs = clientDb.getQuoteRequests();
      const rQuotes = clientDb.getQuotes();
      const rLogs = clientDb.getLogs();
      const rSettings = clientDb.getSettings();

      // Merge backend appointments (created from the client portal / chatbot)
      try {
        const apiApts = await apiGetAllAppointments();
        if (apiApts && apiApts.length > 0) {
          const mapped: Appointment[] = apiApts.map((a: any) => ({
            id: a._id,
            userId: a.userId,
            clientName: a.clientName,
            clientEmail: a.clientEmail,
            title: a.title,
            date: a.date,
            timeSlot: a.timeSlot,
            timezone: a.timezone,
            status: a.status,
            adminNotes: a.adminNotes,
            createdAt: a.createdAt,
          }));
          const merged = new Map<string, Appointment>();
          rApts.forEach((a) => merged.set(a.id, a));
          mapped.forEach((a) => merged.set(a.id, a));
          setAppointments(Array.from(merged.values()));
        } else {
          setAppointments(rApts);
        }
      } catch {
        setAppointments(rApts);
      }

      if (!isApiSession) {
        setQuoteRequests(rReqs);
        setQuotes(rQuotes);
      }
      setLogs(rLogs);

      const mergedLeads = new Map<string, Lead>();
      rLeads.forEach((l) => mergedLeads.set(l.id, l));
      apiLeadsRef.current.forEach((l) => {
        if (!mergedLeads.has(l.id)) mergedLeads.set(l.id, l);
      });
      const leadsAll = Array.from(mergedLeads.values());
      setLeads(leadsAll);

      if (rSettings) {
        setSettings(rSettings);
        setWebsiteName(rSettings.websiteName || "");
        setChatbotPrompt(rSettings.chatbotPrompt || "");
        setWelcomeMessage(rSettings.welcomeMessage || "");
        setEmailTemplateQuote(rSettings.emailTemplateQuote || "");
        setEmailTemplateAppointment(rSettings.emailTemplateAppointment || "");
      }

      const analyticsLeads = isApiSession ? apiLeadsRef.current : leadsAll;
      const analyticsRequests = isApiSession ? apiQuoteRequests : rReqs;
      const analyticsQuotes = isApiSession ? apiQuoteData : rQuotes;

      if (!analyticsLeads || !analyticsRequests || !analyticsQuotes || (isApiSession && !apiLeadsLoaded)) {
        setAnalyticsError(t("Could not load all analytics data. Check the server connection.", "Impossible de charger toutes les données des statistiques. Vérifiez la connexion au serveur."));
        return;
      }

      setAnalyticsError("");
      const prospectKeys = new Set<string>();
      analyticsLeads.forEach((lead) => {
        const email = lead.email?.trim().toLowerCase();
        prospectKeys.add(email ? `email:${email}` : `lead:${lead.id}`);
      });
      analyticsRequests.forEach((request) => {
        const email = request.userEmail?.trim().toLowerCase();
        const identity = email || request.userId || request.id;
        prospectKeys.add(email ? `email:${email}` : `client:${identity}`);
      });
      const totalProspects = prospectKeys.size;
      const totalRequests = analyticsRequests.length;
      const totalQuotes = analyticsQuotes.length;
      const acceptedQuotes = analyticsQuotes.filter((q) => q.status === "accepted");
      const revenue = acceptedQuotes.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      );

      const pendingQuotes = analyticsQuotes.filter((q) => q.status === "sent").length;
      const pendingQuoteAmount = analyticsQuotes
        .filter((q) => q.status === "sent")
        .reduce((acc, curr) => acc + curr.amount, 0);

      const conversionRate =
        totalQuotes > 0
          ? Math.round((acceptedQuotes.length / totalQuotes) * 100)
          : 0;

      const requestsByService: Record<string, number> = {
        ...analyticsRequests.reduce<Record<string, number>>((counts, request) => {
          const service = request.projectType.trim() || "Service non précisé";
          counts[service] = (counts[service] || 0) + 1;
          return counts;
        }, {}),
      };
      const unassignedServiceRequests = requestsByService["Service non précisé"] || 0;

      const currentMonth = new Date();
      const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 5 + index, 1);
        const monthQuotes = acceptedQuotes.filter((quote) => {
          const createdAt = new Date(quote.createdAt);
          return createdAt.getFullYear() === date.getFullYear()
            && createdAt.getMonth() === date.getMonth();
        });
        return {
          name: date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short" }),
          revenue: monthQuotes.reduce((sum, quote) => sum + quote.amount, 0),
        };
      });

      setAnalytics({
        totalProspects,
        totalRequests,
        totalQuotes,
        acceptedQuoteCount: acceptedQuotes.length,
        unassignedServiceRequests,
        revenue,
        pendingQuotes,
        pendingQuoteAmount,
        conversionRate,
        requestsByService,
        monthlyRevenue: revenueByMonth,
      });
    } catch (e) {
      console.error("Admin fetch failed:", e);
    }
  };

  const handleRequestAssignment = async (requestId: string, managerId: string) => {
    try {
      await apiUpdateDemande(requestId, { manager: managerId || null });
      await fetchAdminData();
    } catch (error) {
      console.error("Could not update quote request assignment.", error);
      alert(error instanceof Error ? error.message : t("Could not update the assignment.", "Impossible de mettre à jour l’attribution."));
    }
  };

  const handleRequestArchive = async (request: QuoteRequest) => {
    const archive = !request.archivedAt;
    try {
      await apiUpdateDemande(request.id, { archive });
      if (archive && selectedReq?.id === request.id) {
        setSelectedReq(null);
      }
      await fetchAdminData();
    } catch (error) {
      console.error("Could not update quote request archive status.", error);
      alert(error instanceof Error ? error.message : t("Could not update archive status.", "Impossible de mettre à jour le statut d’archivage."));
    }
  };

  const fetchMessagingData = async () => {
    if (localStorage.getItem("ebi_auth_mode") === "api") {
      try {
        const [apiUsers, apiMessages] = await Promise.all([
          apiGetUsersByRole("client"),
          apiGetMessages(),
        ]);
        const users: User[] = apiUsers.map((user) => ({
          id: user._id,
          name: user.fullname,
          email: user.email,
          role: "client",
          createdAt: user.createdAt || "",
        }));
        const conversationsByClientAndDepartment = new Map<string, Conversation>();
        users.forEach((user) => {
          const conversationId = `${user.id}:general`;
          conversationsByClientAndDepartment.set(conversationId, {
            id: conversationId,
            userId: user.id,
            clientName: user.name,
            clientEmail: user.email,
            status: "active",
            department: "general",
            repName: getDepartment("general").repName,
            repRole: getDepartment("general").repRole,
            lastMessageAt: "",
          });
        });
        apiMessages.forEach((message) => {
          const clientId = typeof message.client === "object" && message.client
            ? message.client._id
            : typeof message.client === "string" ? message.client : "";
          const clientName = typeof message.client === "object" && message.client
            ? message.client.fullname
            : users.find((user) => user.id === clientId)?.name || t("Client", "Client");
          const department = message.departement || "general";
          const conversationId = `${clientId}:${department}`;
          const conversation: Conversation = conversationsByClientAndDepartment.get(conversationId) || {
            id: conversationId,
            userId: clientId,
            clientName,
            clientEmail: users.find((user) => user.id === clientId)?.email || "",
            status: "active" as const,
            department,
            repName: getDepartment(department).repName,
            repRole: getDepartment(department).repRole,
            lastMessageAt: message.createdAt,
          };
          if (!conversation.lastMessageAt || new Date(message.createdAt) >= new Date(conversation.lastMessageAt)) {
            conversation.lastMessageAt = message.createdAt;
            conversation.summary = message.contenu;
          }
          conversationsByClientAndDepartment.set(conversationId, conversation);
        });
        const conversations = Array.from(conversationsByClientAndDepartment.values())
          .sort((a, b) => (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0) - (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0));
        setAllUsers(users);
        setConversations(conversations);
        setMessagingError("");
        setSelectedConversation((current) =>
          conversations.find((conversation) => conversation.id === current?.id) || conversations[0] || null,
        );
        return;
      } catch (error) {
        console.error("Could not load admin conversations.", error);
        setMessagingError(error instanceof Error ? error.message : t("Could not load conversations.", "Impossible de charger les conversations."));
        setConversations([]);
        setChatMessages([]);
        return;
      }
    }

    const users = clientDb.getUsers();
    setAllUsers(users);

    const clientUsers = users.filter((u) => u.role === "client");
    const convs = clientDb.getConversations();
    setConversations(convs);

    if (!selectedConversation && convs.length > 0) {
      setSelectedConversation(convs[0]);
    }
  };

  const handleUploadDocumentForClient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDocumentClientId || !documentUploadFile) {
      setDocumentActionMessage(t("Choose a client and a file before sending.", "Choisissez un client et un fichier avant l’envoi."));
      return;
    }
    setIsUploadingDocument(true);
    setDocumentActionMessage("");
    try {
      await apiUploadDocumentForClient(
        selectedDocumentClientId,
        selectedDocumentRequestId,
        documentUploadFile,
      );
      setDocumentUploadFile(null);
      setSelectedDocumentRequestId("");
      if (documentUploadInputRef.current) documentUploadInputRef.current.value = "";
      setDocumentActionMessage(t("Document sent to the client. A notification has been sent.", "Document envoyé au client. Une notification lui a été transmise."));
      setDocuments(await apiGetDocuments());
    } catch (error) {
      console.error("Could not send document to client.", error);
      setDocumentActionMessage(error instanceof Error ? error.message : t("Document could not be sent.", "Échec de l’envoi du document."));
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDownloadSharedDocument = async (doc: ApiDocument) => {
    try {
      await apiDownloadDocument(doc._id, doc.nom_fichier);
    } catch (error) {
      console.error("Could not download shared document.", error);
      setDocumentActionMessage(error instanceof Error ? error.message : t("Download failed.", "Échec du téléchargement."));
    }
  };

  const fetchChatMessages = async (conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    if (localStorage.getItem("ebi_auth_mode") === "api") {
      try {
        const apiMessages = await apiGetMessagesByClient(conv.userId, conv.department || "general");
        setChatMessages(apiMessages.map((m: ApiMessage) => ({
          id: m._id,
          conversationId: conversationId,
          senderId: typeof m.expediteur === "object" && m.expediteur ? m.expediteur._id : typeof m.expediteur === "string" ? m.expediteur : "",
          senderName: typeof m.expediteur === "object" && m.expediteur ? m.expediteur.fullname : t("User", "Utilisateur"),
          senderRole: (typeof m.expediteur === "object" && m.expediteur ? m.expediteur.role : "client") as "admin" | "client",
          text: m.contenu,
          timestamp: m.createdAt,
        })));
        setMessagingError("");
      } catch (error) {
        console.error("Could not load conversation history.", error);
        setMessagingError(error instanceof Error ? error.message : t("Could not load conversation history.", "Impossible de charger l’historique."));
      }
      return;
    }

    const allMsgs = clientDb.getMessages();
    const convMsgs = allMsgs.filter((m) => m.conversationId === conversationId);
    setChatMessages(convMsgs);
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchChatMessages(selectedConversation.id);
    }
    const interval = setInterval(() => {
      if (selectedConversation) fetchChatMessages(selectedConversation.id);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedConversation, conversations, language]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const contenu = chatInput.trim();
    if (!contenu || !selectedConversation || isSendingMessage) return;
    setIsSendingMessage(true);
    setMessagingError("");

    try {
      if (localStorage.getItem("ebi_auth_mode") === "api") {
        await apiCreateMessage({
          client: selectedConversation.userId,
          contenu,
          departement: selectedConversation.department || "general",
        });
        setChatInput("");
        await fetchMessagingData();
        await fetchChatMessages(selectedConversation.id);
        return;
      }

      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversation.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: "admin",
        text: contenu,
        timestamp: new Date().toISOString(),
      };

      const allMsgs = clientDb.getMessages();
      allMsgs.push(newMsg);
      clientDb.setMessages(allMsgs);

      const convs = clientDb.getConversations();
      const conv = convs.find((c) => c.id === selectedConversation.id);
      if (conv) {
        conv.lastMessageAt = new Date().toISOString();
        conv.summary = contenu.substring(0, 40);
        clientDb.setConversations(convs);
      }

      clientDb.addNotification(
        selectedConversation.userId,
        "New Message from EBI",
        `New message from ${currentUser.name}: "${contenu.substring(0, 50)}"`,
      );

      setChatInput("");
      fetchChatMessages(selectedConversation.id);
      fetchMessagingData();
    } catch (err) {
      console.error("Could not send message to client.", err);
      setMessagingError(err instanceof Error ? err.message : t("Message could not be sent.", "Échec de l’envoi du message."));
    } finally {
      setIsSendingMessage(false);
    }
  };

  function mapStatut(s: string): QuoteRequest["status"] {
    const map: Record<string, QuoteRequest["status"]> = {
      en_attente: "new",
      en_cours: "in_review",
      devis_envoye: "quoted",
      accepte: "accepted",
      refuse: "rejected",
    };
    return map[s] || "new";
  }

  function mapDevisStatut(s: string): Quote["status"] {
    const map: Record<string, Quote["status"]> = {
      envoye: "sent",
      telecharge: "sent",
      archive: "rejected",
      accepte: "accepted",
      refuse: "rejected",
    };
    return map[s] || "sent";
  }

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      if (/^[0-9a-f]{24}$/i.test(leadId)) {
        await apiUpdateLead(leadId, {
          status: updates.status,
          priority: updates.priority,
          suggestedDepartment: updates.suggestedDepartment,
          notes: updates.notes,
        } as any);
      }
    } catch (err) {
      console.error("API lead update failed:", err);
    }
    try {
      const leadsList = clientDb.getLeads();
      const updatedList = leadsList.map((l) => {
        if (l.id === leadId) {
          return { ...l, ...updates };
        }
        return l;
      });
      clientDb.setLeads(updatedList);

      clientDb.addActivityLog(
        currentUser.id,
        currentUser.name,
        `Updated lead ID ${leadId} status/notes`,
      );
      setEditingLeadId(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (
      !window.confirm(
        t("Are you sure you want to delete this lead? This action cannot be undone.", "Voulez-vous vraiment supprimer ce prospect ? Cette action est irréversible."),
      )
    )
      return;
    try {
      if (/^[0-9a-f]{24}$/i.test(leadId)) {
        await apiDeleteLead(leadId);
      }
    } catch (err) {
      console.error("API lead delete failed:", err);
    }
    try {
      const leadsList = clientDb.getLeads();
      const filtered = leadsList.filter((l) => l.id !== leadId);
      clientDb.setLeads(filtered);

      clientDb.addActivityLog(
        currentUser.id,
        currentUser.name,
        `Deleted lead ID ${leadId}`,
      );
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAppointment = (
    aptId: string,
    status: "pending" | "confirmed" | "cancelled" | "completed",
    customNotes?: string,
  ) => {
    try {
      // Sync to backend when the appointment lives there (Mongo ObjectId)
      try {
        apiUpdateAppointmentStatus(aptId, {
          status,
          ...(customNotes !== undefined ? { adminNotes: customNotes } : {}),
        });
      } catch { /* fallback to clientDb */ }

      const aptsList = clientDb.getAppointments();
      const found = aptsList.find((a) => a.id === aptId);
      if (found) {
        found.status = status;
        if (customNotes !== undefined) found.adminNotes = customNotes;
        clientDb.setAppointments(aptsList);

        clientDb.addNotification(
          found.userId,
          `Appointment ${status.toUpperCase()}`,
          `Your consultation requested on ${found.date} ("${found.title}") is now ${status}.`,
        );

        clientDb.addActivityLog(
          currentUser.id,
          currentUser.name,
          `Updated appointment ${aptId} to ${status}`,
        );
      }

      setEditingAptId(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !quoteAmount) return;

    setIsIssuingQuote(true);

    if (localStorage.getItem("ebi_auth_mode") === "api") {
      try {
        await apiCreateDevis({
          demande: selectedReq.id,
          montant: parseFloat(quoteAmount),
          terms: quoteTerms,
        });
        clientDb.addActivityLog(
          currentUser.id,
          currentUser.name,
          `Issued quotation of €${quoteAmount} for "${selectedReq.projectType}"`,
        );
        setSelectedReq(null);
        setQuoteAmount("");
        fetchAdminData();
      } catch (error) {
        console.error("API quote creation failed.", error);
        alert(error instanceof Error ? error.message : t("Could not issue the quote.", "Impossible d’émettre le devis."));
      } finally {
        setIsIssuingQuote(false);
      }
      return;
    }

    try {
      const quotesList = clientDb.getQuotes();
      const newQuote: Quote = {
        id: `q-${Math.random().toString(36).substring(2, 11)}`,
        quoteRequestId: selectedReq.id,
        clientName: selectedReq.clientName,
        projectName: selectedReq.projectType,
        amount: parseFloat(quoteAmount),
        terms: quoteTerms,
        status: "sent",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        createdAt: new Date().toISOString(),
      };
      quotesList.push(newQuote);
      clientDb.setQuotes(quotesList);

      const reqList = clientDb.getQuoteRequests();
      const req = reqList.find((r) => r.id === selectedReq.id);
      if (req) {
        req.status = "quoted";
        clientDb.setQuoteRequests(reqList);
      }

      clientDb.addNotification(
        selectedReq.userId,
        "Formal SLA Pricing Generated",
        `A custom quotation of €${parseFloat(quoteAmount).toLocaleString()} is ready for your project "${selectedReq.projectType}".`,
      );

      clientDb.addActivityLog(
        currentUser.id,
        currentUser.name,
        `Issued quotation of €${quoteAmount} for "${selectedReq.projectType}"`,
      );

      setSelectedReq(null);
      setQuoteAmount("");
      fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsIssuingQuote(false);
    }
  };

  const handleSaveSettings = () => {
    try {
      const newSettings: SystemSettings = {
        websiteName,
        chatbotPrompt,
        welcomeMessage,
        emailTemplateQuote,
        emailTemplateAppointment,
      };
      clientDb.setSettings(newSettings);

      clientDb.addActivityLog(
        currentUser.id,
        currentUser.name,
        `Updated system configurations`,
      );
      alert(t("EBI system settings saved successfully!", "La configuration du système EBI a été enregistrée."));
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = (reportType: "leads" | "quotes" | "financials") => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === "leads") {
      csvContent +=
        "ID,Name,Company,Email,Phone,Department,Priority,Status,Created At\n";
      leads.forEach((l) => {
        csvContent += `"${l.id}","${l.name}","${l.company}","${l.email}","${l.phone}","${l.suggestedDepartment || "Development"}","${l.priority || "medium"}","${l.status}","${l.createdAt}"\n`;
      });
    } else if (reportType === "quotes") {
      csvContent +=
        "QuoteID,Client,Project,Amount,Status,Expiry Date,Created At\n";
      quotes.forEach((q) => {
        csvContent += `"${q.id}","${q.clientName}","${q.projectName}",${q.amount},"${q.status}","${q.expiryDate}","${q.createdAt}"\n`;
      });
    } else {
      csvContent += "Financial Metric,Value\n";
      csvContent += `"Prospects",${analytics?.totalProspects || 0}\n`;
      csvContent += `"Quote Requests",${analytics?.totalRequests || 0}\n`;
      csvContent += `"Total Quote Proposals",${analytics?.totalQuotes || 0}\n`;
      csvContent += `"Pending Quote Proposals",${analytics?.pendingQuotes || 0}\n`;
      csvContent += `"Accepted Project Revenue",${analytics?.revenue || 0}\n`;
      csvContent += `"Quote Conversion Rate",${analytics?.conversionRate || 0}%\n`;
      csvContent += "Requests by Service,Count\n";
      Object.entries(analytics?.requestsByService || {}).forEach(([service, count]) => {
        csvContent += `"${service}",${count}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `EBI_Services_CRM_Report_${reportType}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.company.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (lead.projectDescription || "")
        .toLowerCase()
        .includes(leadSearch.toLowerCase());

    const matchesDept =
      leadDeptFilter === "all" || lead.suggestedDepartment === leadDeptFilter;
    const matchesStatus =
      leadStatusFilter === "all" || lead.status === leadStatusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const revenueChartData = analytics?.monthlyRevenue || [];

  const servicePieData = analytics?.requestsByService
    ? Object.keys(analytics.requestsByService).map((key) => ({
        name: key,
        value: analytics.requestsByService[key],
      }))
    : [];

  const COLORS = ["#1e3a8a", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
  const visibleQuoteRequests = quoteRequests.filter((request) =>
    Boolean(request.archivedAt) === showArchivedRequests,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-100 flex items-center w-fit gap-1.5 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
            {t("Executive CRM Command Center", "Centre de commande CRM exécutif")}
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {t("EBI CRM & SLA Dashboard", "Tableau de bord CRM et SLA EBI")}
          </h1>
          <p className="text-xs text-gray-500">
            {t("Secure admin authorization active:", "Autorisation administrateur sécurisée active :")} {currentUser.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchAdminData()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500 shadow-sm bg-white cursor-pointer"
            title={t("Refresh dashboard data", "Actualiser les données du tableau de bord")}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleExportCSV("leads")}
            className="rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white px-3.5 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span>{t("Export Leads", "Exporter les prospects")}</span>
          </button>
          <button
            onClick={() => handleExportCSV("financials")}
            className="rounded-lg bg-blue-900 hover:bg-blue-950 text-white px-3.5 py-2 text-xs font-semibold shadow flex items-center gap-1.5 cursor-pointer"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{t("Export Analytics", "Exporter les statistiques")}</span>
          </button>
        </div>
      </div>

      {}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 text-xs font-bold tracking-wide uppercase">
          {[
            { id: "dashboard", label: t("CRM Analytics", "Statistiques CRM") },
            { id: "crm", label: t("Manage Leads", "Gérer les prospects") },
            { id: "quotes", label: t("Quote Proposals", "Propositions de devis") },
            { id: "documents", label: t("Documents", "Documents") },
            { id: "appointments", label: t("Appointments Board", "Tableau des rendez-vous") },
            { id: "messaging", label: t("Messaging", "Messagerie") },
            { id: "settings", label: t("System Configs", "Configuration système") },
            { id: "logs", label: t("Audit Logs", "Journaux d’audit") },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setAdminSubTab(sub.id as any)}
              className={`py-2 border-b-2 cursor-pointer transition-all ${
                adminSubTab === sub.id
                  ? "border-blue-900 text-blue-900 font-bold"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </nav>
      </div>

      {}
      {}
      {}
      {adminSubTab === "dashboard" && (
        <div className="space-y-8">
          {analyticsError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {analyticsError}
            </div>
          )}
          {}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-left">
              <span className="block text-[10px] text-gray-400 font-bold uppercase">
                {t("Prospects", "Prospects")}
              </span>
              <span className="block text-2.5xl font-extrabold text-slate-900 mt-1">
                {analytics?.totalProspects || 0}
              </span>
              <span className="block text-[9px] text-gray-500 mt-1">
                {t("Leads + quote requests, deduplicated when possible", "Prospects et demandes de devis, dédupliqués si possible")}
              </span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-left">
              <span className="block text-[10px] text-gray-400 font-bold uppercase">
                {t("Quote Proposals", "Propositions de devis")}
              </span>
              <span className="block text-2.5xl font-extrabold text-slate-900 mt-1">
                {analytics?.totalQuotes || 0}
              </span>
              <span className="block text-[9px] text-gray-500 mt-1">
                {analytics?.acceptedQuoteCount || 0} {t("accepted", "acceptés")} — {analytics?.totalRequests || 0} {t("requests", "demandes")}
              </span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-left">
              <span className="block text-[10px] text-gray-400 font-bold uppercase">
                {t("Quote Conversion", "Conversion des devis")}
              </span>
              <span className="block text-2.5xl font-extrabold text-slate-900 mt-1">
                {analytics?.conversionRate || 0}%
              </span>
              <span className="block text-[9px] text-gray-500 mt-1">
                {analytics?.acceptedQuoteCount || 0} / {analytics?.totalQuotes || 0} {t("accepted quotes", "devis acceptés")}
              </span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-left">
              <span className="block text-[10px] text-gray-400 font-bold uppercase">
                {t("Accepted Revenue", "Chiffre d’affaires accepté")}
              </span>
              <span className="block text-2.5xl font-extrabold text-emerald-700 mt-1">
                €{(analytics?.revenue || 0).toLocaleString()}
              </span>
              <span className="block text-[9px] text-gray-500 mt-1">
                {t("Contracts signed", "Contrats signés")}
              </span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-left">
              <span className="block text-[10px] text-gray-400 font-bold uppercase">
                {t("Pending Estimates", "Devis en attente")}
              </span>
              <span className="block text-2.5xl font-extrabold text-amber-600 mt-1">
                {analytics?.pendingQuotes || 0}
              </span>
              <span className="block text-[9px] text-gray-500 mt-1">
                {t("Awaiting client", "En attente du client")} — €{(analytics?.pendingQuoteAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {}
          <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-white" />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-white">
                  {t("Appointments Board", "Tableau des rendez-vous")}
                </h3>
                <p className="text-[10px] text-blue-200">
                  {appointments.length} {t("appointment", "rendez-vous")}
                  {appointments.length === 1 ? "" : t("s", "")} — {t("review pending requests, confirm schedules, and add SLA comments.", "examinez les demandes en attente, confirmez les horaires et ajoutez des commentaires SLA.")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAdminSubTab("appointments")}
              className="rounded-lg bg-white text-blue-900 px-4 py-2 text-xs font-bold shadow hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <CalendarDays className="h-4 w-4" />
              {t("Open Board", "Ouvrir le tableau")}
            </button>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {}
            <div className="md:col-span-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-left space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {t("Performance Over Time", "Évolution des performances")}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {t("Accepted quote revenue over the last six months.", "Chiffre d’affaires des devis acceptés au cours des six derniers mois.")}
                </p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#1e3a8a"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1e3a8a"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} />
                    <YAxis fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1e3a8a"
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      strokeWidth={2.5}
                      name={t("Revenue (€)", "Chiffre d’affaires (€)")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {}
            <div className="md:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-left space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {t("Requests by Service", "Demandes par service")}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {analytics?.totalRequests || 0} {t("submitted quote requests grouped by service.", "demandes de devis reçues, regroupées par service.")}
                </p>
                {!!analytics?.unassignedServiceRequests && (
                  <p className="mt-1 text-[10px] text-amber-700">
                    {analytics.unassignedServiceRequests} {t("request(s) have no linked service.", "demande(s) sans service associé.")}
                  </p>
                )}
              </div>
              <div className="h-44 relative flex items-center justify-center">
                {servicePieData.length === 0 ? (
                  <span className="text-xs text-gray-400">
                    {t("No service data.", "Aucune donnée de service.")}
                  </span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicePieData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {servicePieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-2 text-[10px] border-t border-gray-100 pt-3">
                {servicePieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      ></span>
                      {entry.name === "Service non précisé" ? t("Unspecified service", "Service non précisé") : entry.name}
                    </span>
                    <span className="font-bold text-slate-950">
                      {entry.value} {t("requests", "demandes")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {}
      {}
      {adminSubTab === "crm" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4 text-left">
            <div>
              <h3 className="font-display text-sm font-bold text-slate-950">
                {t("Acquired CRM Leads", "Prospects CRM recueillis")}
              </h3>
              <p className="text-[10px] text-gray-400">
                {t("Search, filter, and review lead requests classified by AI.", "Recherchez, filtrez et consultez les demandes de prospects classées par l’IA.")}
              </p>
            </div>

            {}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("Search leads...", "Rechercher des prospects...")}
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-xs w-full sm:w-48 focus:ring-1 focus:ring-blue-900 focus:outline-none"
                />
              </div>
              <select
                value={leadDeptFilter}
                onChange={(e) => setLeadDeptFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
              >
                <option value="all">{t("All Departments", "Tous les départements")}</option>
                <option value="Development">{t("Development", "Développement")}</option>
                <option value="Recruitment">{t("Recruitment", "Recrutement")}</option>
                <option value="Outsourcing">{t("Outsourcing", "Externalisation")}</option>
              </select>
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
              >
                <option value="all">{t("All Statuses", "Tous les statuts")}</option>
                <option value="new">{t("New", "Nouveau")}</option>
                <option value="contacted">{t("Contacted", "Contacté")}</option>
                <option value="qualified">{t("Qualified", "Qualifié")}</option>
                <option value="lost">{t("Lost", "Perdu")}</option>
              </select>
            </div>
          </div>

          {}
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              {t("No matching leads found.", "Aucun prospect correspondant.")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-150 text-gray-400 font-bold uppercase tracking-wide">
                    <th className="p-3">{t("Client details", "Coordonnées du client")}</th>
                    <th className="p-3">{t("AI Department", "Département IA")}</th>
                    <th className="p-3">{t("AI Priority", "Priorité IA")}</th>
                    <th className="p-3">{t("Lead Status", "Statut du prospect")}</th>
                    <th className="p-3">{t("CRM Notes", "Notes CRM")}</th>
                    <th className="p-3 text-right">{t("Actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50">
                      <td className="p-3 space-y-1 max-w-[200px]">
                        <span className="font-bold text-slate-900 block">
                          {lead.name}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {lead.company} • {lead.country}
                        </span>
                        <span className="text-[10px] text-blue-900 block">
                          {lead.email}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lead.suggestedDepartment === "Development"
                              ? "bg-blue-50 text-blue-700"
                              : lead.suggestedDepartment === "Recruitment"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {lead.suggestedDepartment || t("Development", "Développement")}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            lead.priority === "high"
                              ? "text-red-600"
                              : lead.priority === "medium"
                                ? "text-amber-600"
                                : "text-gray-400"
                          }`}
                        >
                          ● {lead.priority === "high" ? t("high", "élevée") : lead.priority === "medium" || !lead.priority ? t("medium", "moyenne") : t("low", "faible")}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleUpdateLead(lead.id, {
                              status: e.target.value as any,
                            })
                          }
                          className="border border-gray-200 rounded p-1 text-[10px] bg-white font-semibold focus:outline-none"
                        >
                          <option value="new">{t("New", "Nouveau")}</option>
                          <option value="contacted">{t("Contacted", "Contacté")}</option>
                          <option value="qualified">{t("Qualified", "Qualifié")}</option>
                          <option value="lost">{t("Lost", "Perdu")}</option>
                        </select>
                      </td>
                      <td className="p-3 max-w-xs">
                        {editingLeadId === lead.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={leadNoteText}
                              onChange={(e) => setLeadNoteText(e.target.value)}
                              className="border border-gray-300 rounded p-1 text-[10px] flex-1 focus:outline-none"
                            />
                            <button
                              onClick={() =>
                                handleUpdateLead(lead.id, {
                                  notes: leadNoteText,
                                })
                              }
                              aria-label={t("Save lead note", "Enregistrer la note du prospect")}
                              className="p-1 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                              <Save className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                              {lead.notes || t("No CRM comments yet.", "Aucun commentaire CRM pour le moment.")}
                            </p>
                            <button
                              onClick={() => {
                                setEditingLeadId(lead.id);
                                setLeadNoteText(lead.notes || "");
                              }}
                              className="text-[9px] text-blue-900 font-bold hover:underline"
                            >
                              {t("Edit Note", "Modifier la note")}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition"
                          title={t("Delete lead", "Supprimer le prospect")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {}
      {}
      {}
      {adminSubTab === "quotes" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {}
          <div className="md:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <h3 className="font-display text-sm font-bold text-slate-950 text-left">
                {showArchivedRequests ? t("Archived Quote Requests", "Demandes de devis archivées") : t("Quote Requests Pipeline", "Suivi des demandes de devis")}
              </h3>
              <button
                type="button"
                onClick={() => setShowArchivedRequests((current) => !current)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                {showArchivedRequests ? t("View active requests", "Voir les demandes actives") : t("View archive", "Voir les archives")}
              </button>
            </div>

            {visibleQuoteRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                {showArchivedRequests ? t("No archived quote requests.", "Aucune demande de devis archivée.") : t("No quote requests submitted yet.", "Aucune demande de devis reçue pour le moment.")}
              </div>
            ) : (
              <div className="space-y-4">
                {visibleQuoteRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-gray-150 p-4 space-y-2 text-left hover:border-blue-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {req.projectType}
                        </span>
                        <span className="text-[9px] text-gray-400 block">
                          {req.clientName} • {req.company}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          ["new", "in_review"].includes(req.status)
                            ? "bg-blue-100 text-blue-700"
                            : req.status === "quoted"
                              ? "bg-amber-100 text-amber-700"
                              : req.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {req.status === "new" ? t("New", "Nouveau") : req.status === "in_review" ? t("In review", "En cours d’examen") : req.status === "quoted" ? t("Quoted", "Devis envoyé") : req.status === "accepted" ? t("Accepted", "Accepté") : t("Rejected", "Refusé")}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed bg-slate-50 p-2 rounded">
                      {req.requirements}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-400">
                      <div>
                        <span className="font-bold text-slate-900">
                          {t("Budget:", "Budget :")}
                        </span>{" "}
                        {req.budget}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">
                          {t("Deadline:", "Échéance :")}
                        </span>{" "}
                        {req.deadline}
                      </div>
                    </div>

                    {localStorage.getItem("ebi_auth_mode") === "api" && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-700">
                          {t("Assigned manager", "Responsable attribué")}
                          <select
                            value={req.managerId || ""}
                            onChange={(event) => handleRequestAssignment(req.id, event.target.value)}
                            className="max-w-48 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px]"
                          >
                            <option value="">{t("Unassigned", "Non attribué")}</option>
                            {adminManagers.map((manager) => (
                              <option key={manager._id} value={manager._id}>
                                {manager.fullname}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRequestArchive(req)}
                          className="rounded-md border border-gray-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          {req.archivedAt ? t("Restore request", "Restaurer la demande") : t("Archive request", "Archiver la demande")}
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      {req.attachmentName ? (
                        <a
                          href={req.attachmentUrl}
                          className="text-[10px] font-bold text-blue-900 hover:underline"
                        >
                          📎 {t("Attached:", "Pièce jointe :")} {req.attachmentName}
                        </a>
                      ) : (
                        <span className="text-[9px] text-gray-400">
                          {t("No attachments.", "Aucune pièce jointe.")}
                        </span>
                      )}

                      {!req.archivedAt && ["new", "in_review"].includes(req.status) && (
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setQuoteAmount("");
                          }}
                          className="bg-blue-900 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-blue-950 transition cursor-pointer"
                        >
                          {t("Generate Formal Quote", "Générer un devis officiel")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="md:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-950 border-b border-gray-100 pb-3 text-left font-semibold">
              {t("Pricing Generator", "Générateur de devis")}
            </h3>

            {selectedReq ? (
              <form onSubmit={handleIssueQuote} className="space-y-4 text-left">
                <div className="bg-slate-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
                  <div>
                    <span className="font-bold text-slate-900">{t("Project:", "Projet :")}</span>{" "}
                    {selectedReq.projectType}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{t("Client:", "Client :")}</span>{" "}
                    {selectedReq.clientName} ({selectedReq.company})
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">
                      {t("Stated Budget:", "Budget indiqué :")}
                    </span>{" "}
                    {selectedReq.budget}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                    {t("Quote Pricing Amount (€) *", "Montant du devis (€) *")}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={t("e.g. 15000", "ex. 15 000")}
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                    {t("SLA Contract & Payment Terms", "Contrat SLA et modalités de paiement")}
                  </label>
                  <textarea
                    rows={4}
                    value={quoteTerms}
                    onChange={(e) => setQuoteTerms(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isIssuingQuote}
                    className="flex-1 bg-blue-900 hover:bg-blue-950 text-white rounded-lg py-2 text-xs font-semibold shadow disabled:opacity-45"
                  >
                    {isIssuingQuote ? t("Issuing...", "Émission...") : t("Issue Formal Quote", "Émettre le devis officiel")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedReq(null)}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg px-3 py-2 text-xs"
                  >
                    {t("Cancel", "Annuler")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-16 text-gray-400 text-xs">
                {t("Select an active quote request from the left pipeline to load the pricing generator.", "Sélectionnez une demande de devis active dans la liste pour ouvrir le générateur de devis.")}
              </div>
            )}
          </div>
        </div>
      )}

      {adminSubTab === "documents" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <form
            onSubmit={handleUploadDocumentForClient}
            className="xl:col-span-2 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm"
          >
            <div>
              <h3 className="font-display text-sm font-bold text-slate-950">{t("Send a document to a client", "Envoyer un document à un client")}</h3>
              <p className="mt-1 text-xs text-gray-500">{t("The file will be private and accessible only to the selected client and administrators.", "Le fichier sera privé et accessible uniquement au client choisi et à l’administration.")}</p>
            </div>
            <label className="block space-y-1 text-xs font-semibold text-gray-700">
              {t("Client", "Client")}
              <select
                value={selectedDocumentClientId}
                onChange={(event) => {
                  setSelectedDocumentClientId(event.target.value);
                  setSelectedDocumentRequestId("");
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
                required
              >
                <option value="">{t("Select a client", "Sélectionner un client")}</option>
                {documentClients.map((client) => (
                  <option key={client._id} value={client._id}>{client.fullname} — {client.email}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1 text-xs font-semibold text-gray-700">
              {t("Related request (optional)", "Demande associée (facultatif)")}
              <select
                value={selectedDocumentRequestId}
                onChange={(event) => setSelectedDocumentRequestId(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <option value="">{t("General document", "Document général")}</option>
                {quoteRequests.filter((request) => request.userId === selectedDocumentClientId).map((request) => (
                  <option key={request.id} value={request.id}>{request.projectType} — {request.requirements.slice(0, 45)}</option>
                ))}
              </select>
            </label>
            <input
              ref={documentUploadInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.csv"
              onChange={(event) => setDocumentUploadFile(event.target.files?.[0] || null)}
              className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-900"
              required
            />
            <p className="text-[10px] text-gray-400">{t("PDF, Word, Excel, images and text files — 10 MB maximum.", "PDF, Word, Excel, images et fichiers texte — 10 Mo maximum.")}</p>
            <button
              type="submit"
              disabled={isUploadingDocument || documentClients.length === 0}
              className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-950 disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
              {isUploadingDocument ? t("Sending...", "Envoi...") : t("Send to client", "Envoyer au client")}
            </button>
            {documentActionMessage && <p role="status" className="text-xs text-blue-900">{documentActionMessage}</p>}
          </form>

          <section className="xl:col-span-3 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="border-b border-gray-100 pb-3 text-left">
              <h3 className="font-display text-sm font-bold text-slate-950">{t("Shared documents", "Documents partagés")}</h3>
              <p className="mt-1 text-xs text-gray-500">{t("History of documents sent to and received from clients.", "Historique des documents envoyés et reçus pour les clients.")}</p>
            </div>
            {documents.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">{t("No shared documents yet.", "Aucun document partagé pour le moment.")}</div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const clientName = typeof doc.client === "object" && doc.client ? doc.client.fullname : t("Client", "Client");
                  const senderName = typeof doc.uploaded_by === "object" && doc.uploaded_by ? doc.uploaded_by.fullname : t("User", "Utilisateur");
                  const requestName = typeof doc.demande === "object" && doc.demande ? doc.demande.besoin : "";
                  return (
                    <div key={doc._id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-150 p-4 text-left">
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-blue-900" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900">{doc.nom_fichier}</p>
                          <p className="text-[10px] text-gray-500">{clientName} · {doc.origine === "admin" ? t("Sent by EBI", "Envoyé par EBI") : t("Received from client", "Reçu du client")} · {senderName}</p>
                          {requestName && <p className="truncate text-[10px] text-gray-400">{requestName}</p>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadSharedDocument(doc)}
                        className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-600 hover:text-blue-900"
                        title={t("Download document", "Télécharger le document")}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {}
      {}
      {}
      {adminSubTab === "appointments" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-display text-sm font-bold text-slate-950 border-b border-gray-100 pb-3 text-left">
            {t("SLA Appointments CMD Board", "Tableau de commande des rendez-vous SLA")}
          </h3>

          {appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              {t("No meetings booked.", "Aucun rendez-vous réservé.")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-gray-150 p-4 text-left space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        {a.title}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        {t("Client:", "Client :")} {a.clientName} ({a.clientEmail})
                      </span>
                      <span className="block text-[9px] text-gray-400 mt-1">
                        {a.date} {t("at", "à")} {a.timeSlot} ({a.timezone})
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        a.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : a.status === "pending"
                            ? "bg-blue-100 text-blue-700"
                            : a.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {a.status === "pending" ? t("Pending", "En attente") : a.status === "confirmed" ? t("Confirmed", "Confirmé") : a.status === "cancelled" ? t("Cancelled", "Annulé") : t("Completed", "Terminé")}
                    </span>
                  </div>

                  {editingAptId === a.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t("Add scheduling comments...", "Ajouter des commentaires sur la planification...")}
                        value={aptNoteText}
                        onChange={(e) => setAptNoteText(e.target.value)}
                        className="border border-gray-300 rounded p-1 text-[10px] flex-1 focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          handleUpdateAppointment(a.id, a.status, aptNoteText)
                        }
                        aria-label={t("Save appointment comments", "Enregistrer les commentaires du rendez-vous")}
                        className="p-1 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        <Save className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 bg-slate-50 p-2 rounded">
                        <span className="font-bold text-slate-900 block">
                          {t("SLA Comments:", "Commentaires SLA :")}
                        </span>
                        {a.adminNotes || t("No supervisor comments yet.", "Aucun commentaire du responsable pour le moment.")}
                      </p>
                      <button
                        onClick={() => {
                          setEditingAptId(a.id);
                          setAptNoteText(a.adminNotes || "");
                        }}
                        className="text-[9px] text-blue-900 font-bold hover:underline"
                      >
                        {t("Edit Comments", "Modifier les commentaires")}
                      </button>
                    </div>
                  )}

                  {a.status === "pending" && (
                    <div className="flex gap-2 pt-1 border-t border-gray-100">
                      <button
                        onClick={() =>
                          handleUpdateAppointment(a.id, "confirmed")
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded py-1.5 text-[10px] font-bold cursor-pointer"
                      >
                        {t("Confirm Slot", "Confirmer le créneau")}
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateAppointment(a.id, "cancelled")
                        }
                        className="flex-1 bg-white border border-gray-300 text-gray-600 rounded py-1.5 text-[10px] font-bold cursor-pointer hover:bg-gray-50"
                      >
                        {t("Decline", "Refuser")}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {adminSubTab === "messaging" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
          <div className="flex h-full">
            {/* Left: Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-display text-sm font-bold text-slate-950 text-left">{t("Client Conversations", "Conversations clients")}</h3>
                <span className="text-[10px] text-gray-400">{t("Select a client to view their chat thread", "Sélectionnez un client pour consulter son fil de discussion")}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                  <div className={`p-6 text-center text-xs ${messagingError ? "text-red-700" : "text-gray-400"}`}>
                    {messagingError || t("No conversations yet", "Aucune conversation pour le moment")}
                  </div>
                )}
                {conversations
                  .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
                  .map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left border-b border-gray-50 hover:bg-slate-50 transition cursor-pointer ${
                        selectedConversation?.id === conv.id ? "bg-blue-50/60 border-l-2 border-l-blue-900" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{conv.clientName || t("Client", "Client")}</span>
                        {conv.lastMessageAt && (
                          <span className="text-[9px] text-gray-400 whitespace-nowrap ml-2">
                            {new Date(conv.lastMessageAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {(conv.repName || conv.repRole) && (
                        <span className="block text-[9px] font-bold text-blue-900 truncate mt-0.5">
                          {conv.repName} · {conv.repRole}
                        </span>
                      )}
                      {conv.summary && (
                        <span className="block text-[10px] text-gray-400 truncate mt-0.5">{conv.summary}</span>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            {/* Right: Message Thread */}
            <div className="flex-1 flex flex-col">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                  {t("Select a client conversation to start messaging", "Sélectionnez une conversation client pour commencer à échanger")}
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-950 flex items-center justify-center text-white text-[10px] font-bold">
                      {(selectedConversation.clientName || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">{selectedConversation.clientName || t("Client", "Client")}</span>
                      <span className="block text-[10px] text-gray-400">{t("Direct Support Channel", "Canal d’assistance directe")}</span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-[10px] text-gray-400 py-8">{t("No messages yet. Send the first message below.", "Aucun message pour le moment. Envoyez le premier message ci-dessous.")}</div>
                    )}
                    {chatMessages.map((m) => (
                      <div key={m.id} className={`flex items-start space-x-2 ${m.senderId === currentUser.id ? "flex-row-reverse space-x-reverse" : ""}`}>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          m.senderId === currentUser.id ? "bg-blue-600" : "bg-blue-950"
                        }`}>
                          {m.senderId === currentUser.id ? t("Me", "Moi") : "C"}
                        </div>
                        <div className={`max-w-[70%] rounded-xl px-3 py-2 text-xs shadow-sm ${
                          m.senderId === currentUser.id
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-none text-left"
                        }`}>
                          <span className="block text-[8px] opacity-60 font-semibold mb-0.5">{m.senderName}</span>
                          {m.text}
                          <time className="mt-1 block text-[8px] opacity-60">
                            {new Date(m.timestamp).toLocaleString(language === "fr" ? "fr-FR" : "en-US")}
                          </time>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-100 bg-white flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={t("Type a message to this client...", "Écrivez un message à ce client...")}
                      maxLength={5000}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isSendingMessage}
                      aria-label={t("Send message", "Envoyer le message")}
                      className="h-8 w-8 rounded-xl bg-blue-900 text-white flex items-center justify-center hover:bg-blue-950 transition disabled:opacity-45 cursor-pointer"
                    >
                      {isSendingMessage ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {messagingError && <p role="status" className="px-4 pb-3 text-xs text-red-700">{messagingError}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      {}
      {}
      {adminSubTab === "settings" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6 text-left">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-display text-sm font-bold text-slate-950">
              {t("EBI Corporate System Tuner", "Configuration du système d’entreprise EBI")}
            </h3>
            <p className="text-[10px] text-gray-400">
              {t("Dynamically configure landing pages, backend email templates, and AI chatbot prompts.", "Configurez dynamiquement les pages d’accueil, les modèles d’e-mail et les instructions du chatbot IA.")}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                {t("Corporate Platform Name", "Nom de la plateforme")}
              </label>
              <input
                type="text"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                {t("AI Chatbot System Prompt (Instruction Context)", "Instructions système du chatbot IA (contexte)")}
              </label>
              <textarea
                rows={4}
                value={chatbotPrompt}
                onChange={(e) => setChatbotPrompt(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none leading-relaxed font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                {t("Chatbot Welcome Greeting Message", "Message d’accueil du chatbot")}
              </label>
              <input
                type="text"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                  {t("Email Quote Template Body", "Corps du modèle d’e-mail de devis")}
                </label>
                <textarea
                  rows={4}
                  value={emailTemplateQuote}
                  onChange={(e) => setEmailTemplateQuote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                  {t("Email Appointment Template Body", "Corps du modèle d’e-mail de rendez-vous")}
                </label>
                <textarea
                  rows={4}
                  value={emailTemplateAppointment}
                  onChange={(e) => setEmailTemplateAppointment(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="rounded-lg bg-blue-900 hover:bg-blue-950 text-white px-5 py-2.5 text-xs font-bold shadow transition cursor-pointer"
            >
              {t("Save Settings", "Enregistrer les paramètres")}
            </button>
          </div>
        </div>
      )}

      {}
      {}
      {}
      {adminSubTab === "logs" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-display text-sm font-bold text-slate-950 border-b border-gray-100 pb-3 text-left">
            {t("Enterprise Audit Trail Logs", "Journaux d’audit de l’entreprise")}
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-lg border border-gray-150 flex items-center justify-between text-left text-xs"
              >
                <div className="space-y-1">
                  <span className="font-bold text-slate-900">
                    {log.userName} ({log.userId.split("-")[1]})
                  </span>
                  <p className="text-gray-500 leading-none">{log.action}</p>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
