import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  FileText,
  Trash2,
  Edit2,
  Calendar,
  X,
  Check,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { Client, Quote } from '../types';
import { storageService } from '../services/storageService';
import { formatAriary } from '../utils/calculationEngine';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface ClientsViewProps {
  clients: Client[];
  quotes: Quote[];
  onRefresh: () => void;
  onNewQuoteForClient: (client: Client) => void;
  onOpenQuote: (quote: Quote) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  quotes,
  onRefresh,
  onNewQuoteForClient,
  onOpenQuote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Add/Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingClient(null);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormNotes('');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormPhone(client.phone || '');
    setFormAddress(client.address || '');
    setFormNotes(client.notes || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Veuillez saisir le nom du client.');
      return;
    }

    const clientToSave: Client = {
      id: editingClient ? editingClient.id : storageService.generateClientId(),
      name: formName.trim(),
      phone: formPhone.trim(),
      address: formAddress.trim(),
      notes: formNotes.trim(),
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveClient(clientToSave);
    onRefresh();

    if (selectedClient && selectedClient.id === clientToSave.id) {
      setSelectedClient(clientToSave);
    }

    setIsFormOpen(false);
  };

  const handleDeleteClient = () => {
    if (!clientToDelete) return;
    storageService.deleteClient(clientToDelete.id);
    if (selectedClient?.id === clientToDelete.id) {
      setSelectedClient(null);
    }
    setClientToDelete(null);
    onRefresh();
  };

  // Get quotes for a client
  const getClientQuotes = (clientId: string) => {
    return quotes.filter((q) => q.clientId === clientId);
  };

  const getClientTotalAr = (clientId: string) => {
    return getClientQuotes(clientId).reduce((sum, q) => sum + (q.grandTotalAr || 0), 0);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Gestion des Clients
          </h2>
          <p className="text-xs text-slate-400">
            {clients.length} {clients.length > 1 ? 'clients enregistrés' : 'client enregistré'}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 active:scale-95 transition min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          + Ajouter un client
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par nom, téléphone, adresse..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 min-h-[44px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center space-y-2">
          <p className="text-sm text-slate-400">
            {searchQuery ? 'Aucun client ne correspond à votre recherche.' : 'Aucun client enregistré.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            Ajouter le premier client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredClients.map((client) => {
            const clientQuotes = getClientQuotes(client.id);
            const totalAr = getClientTotalAr(client.id);

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 transition cursor-pointer active:scale-99 flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">{client.id}</span>
                    <span className="text-[11px] text-slate-400">
                      {clientQuotes.length} {clientQuotes.length > 1 ? 'devis' : 'devis'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white hover:text-cyan-300 transition">
                    {client.name}
                  </h3>

                  <div className="mt-2 space-y-1 text-xs text-slate-300">
                    {client.phone && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-1.5 text-slate-400 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Total devis</span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      {formatAriary(totalAr)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(client);
                      }}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                      title="Modifier le client"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setClientToDelete(client);
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition"
                      title="Supprimer le client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Detail Sheet / Drawer (Section 4 user prompt) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#0c3e4f] to-[#082832] border-b border-cyan-800/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                  Fiche Client : {selectedClient.id}
                </span>
                <h3 className="text-lg font-black text-white">{selectedClient.name}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(selectedClient)}
                  className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
              {/* Client Info Card */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1.5">
                {selectedClient.phone && (
                  <p className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedClient.phone}</span>
                  </p>
                )}
                {selectedClient.address && (
                  <p className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedClient.address}</span>
                  </p>
                )}
                {selectedClient.notes && (
                  <p className="text-slate-400 pt-1 border-t border-slate-700/60">
                    <strong>Note :</strong> {selectedClient.notes}
                  </p>
                )}
              </div>

              {/* Action: Add product / quote */}
              <div className="flex items-center justify-between pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Devis & Produits de ce client
                </h4>
                <button
                  onClick={() => {
                    const c = selectedClient;
                    setSelectedClient(null);
                    onNewQuoteForClient(c);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-medium text-xs flex items-center gap-1.5 transition active:scale-95 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Ajouter un produit au devis
                </button>
              </div>

              {/* Client Quotes List (Matching Section 4 prompt example) */}
              {getClientQuotes(selectedClient.id).length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-800/30 border border-dashed border-slate-700 text-center">
                  <p className="text-xs text-slate-400">Aucun devis créé pour ce client.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getClientQuotes(selectedClient.id).map((q) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedClient(null);
                        onOpenQuote(q);
                      }}
                      className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono font-bold text-cyan-400">{q.id}</span>
                        <span className="text-slate-400">{q.date}</span>
                      </div>

                      {/* Itemized Products */}
                      <div className="space-y-2 border-t border-slate-700/60 pt-2">
                        {q.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs">
                            <div>
                              <div className="font-semibold text-slate-200">{item.productName}</div>
                              <div className="text-[11px] text-slate-400">
                                {item.dimensions.length} {item.dimensions.length > 1 ? 'dimensions' : 'dimension'}
                                {item.dimensions.map((d) => ` (${d.widthMm}×${d.heightMm} qté ${d.quantity})`).join(', ')}
                              </div>
                            </div>
                            <div className="font-bold text-white tabular-nums">
                              {formatAriary(item.calculationResult.totalProductPriceAr)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total for this quote */}
                      <div className="mt-3 pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Total devis :</span>
                        <span className="font-bold text-emerald-400 text-sm tabular-nums">
                          {formatAriary(q.grandTotalAr)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Total Général du Client (Section 4: Total général du client: 1 470 000 Ar) */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#0c3e4f] to-[#082832] border border-cyan-500/40 flex items-center justify-between text-white">
                    <div>
                      <span className="text-xs text-cyan-200 block uppercase tracking-wider font-semibold">
                        Total général du client :
                      </span>
                      <span className="text-xs text-slate-400">
                        Cumul de tous ses devis
                      </span>
                    </div>
                    <div className="text-xl font-black text-cyan-300 tabular-nums">
                      {formatAriary(getClientTotalAr(selectedClient.id))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                {editingClient ? 'Modifier le client' : 'Ajouter un client'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom du client <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Client A, Société Ravelo..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm min-h-[44px]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Ex: +261 34 00 000 00"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Adresse / Chantier (optionnel)
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Ex: Ivandry, Antananarivo"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Note particulière (optionnel)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Rénovation villa, livraison fin de semaine..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition min-h-[44px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <Check className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!clientToDelete}
        title="Supprimer le client"
        message="Voulez-vous vraiment supprimer cet élément ?"
        itemName={clientToDelete?.name}
        onConfirm={handleDeleteClient}
        onCancel={() => setClientToDelete(null)}
      />
    </div>
  );
};
