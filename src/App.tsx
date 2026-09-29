/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { BottomNav, MainTab } from './components/BottomNav';
import { DashboardView } from './views/DashboardView';
import { ClientsView } from './views/ClientsView';
import { QuotesView } from './views/QuotesView';
import { CatalogView } from './views/CatalogView';
import { ProductsView } from './views/ProductsView';
import { SettingsView } from './views/SettingsView';
import { QuoteEditorView } from './views/QuoteEditorView';
import { storageService } from './services/storageService';
import {
  Client,
  Quote,
  ProductTemplate,
  ProfileReference,
  Category,
  GlassType,
  GlobalSettings,
} from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');

  // Application state
  const [settings, setSettings] = useState<GlobalSettings>(storageService.getSettings());
  const [clients, setClients] = useState<Client[]>(storageService.getClients());
  const [quotes, setQuotes] = useState<Quote[]>(storageService.getQuotes());
  const [products, setProducts] = useState<ProductTemplate[]>(storageService.getProducts());
  const [references, setReferences] = useState<ProfileReference[]>(storageService.getReferences());
  const [categories, setCategories] = useState<Category[]>(storageService.getCategories());
  const [glassTypes, setGlassTypes] = useState<GlassType[]>(storageService.getGlassTypes());

  // Quote Editor state
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [clientForNewQuote, setClientForNewQuote] = useState<Client | null>(null);

  // Reload all data from local storage
  const refreshData = useCallback(() => {
    setSettings(storageService.getSettings());
    setClients(storageService.getClients());
    setQuotes(storageService.getQuotes());
    setProducts(storageService.getProducts());
    setReferences(storageService.getReferences());
    setCategories(storageService.getCategories());
    setGlassTypes(storageService.getGlassTypes());
  }, []);

  // Handlers for quote actions
  const handleOpenNewQuote = (client?: Client) => {
    setCurrentQuote(null);
    setClientForNewQuote(client || null);
    setIsEditingQuote(true);
  };

  const handleOpenExistingQuote = (quote: Quote) => {
    setCurrentQuote(quote);
    setClientForNewQuote(null);
    setIsEditingQuote(true);
  };

  const handleSaveQuote = (savedQuote: Quote) => {
    refreshData();
    setIsEditingQuote(false);
    setCurrentQuote(null);
    setClientForNewQuote(null);
    setActiveTab('quotes');
  };

  const handleCancelQuote = () => {
    setIsEditingQuote(false);
    setCurrentQuote(null);
    setClientForNewQuote(null);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#082029] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top App Bar */}
      <Navbar
        settings={settings}
        activeTab={activeTab}
        onNewQuoteClick={() => handleOpenNewQuote()}
        onSettingsClick={() => setActiveTab('settings')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-4 pb-20">
        {isEditingQuote ? (
          <QuoteEditorView
            initialQuote={currentQuote}
            defaultClient={clientForNewQuote}
            clients={clients}
            products={products}
            categories={categories}
            references={references}
            glassTypes={glassTypes}
            settings={settings}
            onSaveQuote={handleSaveQuote}
            onCancel={handleCancelQuote}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                clients={clients}
                quotes={quotes}
                products={products}
                references={references}
                settings={settings}
                onNavigate={setActiveTab}
                onOpenQuote={handleOpenExistingQuote}
                onNewQuote={() => handleOpenNewQuote()}
                onNewClient={() => setActiveTab('clients')}
              />
            )}

            {activeTab === 'clients' && (
              <ClientsView
                clients={clients}
                quotes={quotes}
                onRefresh={refreshData}
                onNewQuoteForClient={(client) => handleOpenNewQuote(client)}
                onOpenQuote={handleOpenExistingQuote}
              />
            )}

            {activeTab === 'quotes' && (
              <QuotesView
                quotes={quotes}
                settings={settings}
                onRefresh={refreshData}
                onOpenQuote={handleOpenExistingQuote}
                onNewQuote={() => handleOpenNewQuote()}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogView
                references={references}
                categories={categories}
                settings={settings}
                onRefresh={refreshData}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                products={products}
                categories={categories}
                references={references}
                glassTypes={glassTypes}
                onRefresh={refreshData}
                onNavigateToCatalog={() => setActiveTab('catalog')}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                categories={categories}
                glassTypes={glassTypes}
                onRefresh={refreshData}
                onNavigateToCatalog={() => setActiveTab('catalog')}
                onNavigateToProducts={() => setActiveTab('products')}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Thumb Navigation Bar */}
      {!isEditingQuote && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          quotesCount={quotes.length}
          clientsCount={clients.length}
          referencesCount={references.length}
        />
      )}
    </div>
  );
}
