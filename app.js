// Application State
const state = {
  selectedFamily: null,
  problem: {
    title: '',
    timeHorizon: 0,
    budgetCap: 0,
    contextData: {},
    importanceLevel: 5
  },
  alternatives: [],
  criteria: [],
  customCriteria: [],
  performanceMatrix: [],
  preferences: {
    riskTolerance: 5,
    confidenceLevel: 'Medium',
    constraints: ''
  },
  results: null,
  isCalculating: false,
  calculationProgress: 0,
  calculationError: null
};

// Core Criteria (12 standard)
const CORE_CRITERIA = [
  { id: 'C1', name: 'TCO (Total Cost of Ownership)', type: 'cost', weight: 15, unit: '€' },
  { id: 'C2', name: 'Performance', type: 'benefit', weight: 12, unit: '0-100' },
  { id: 'C3', name: 'Affidabilità', type: 'benefit', weight: 10, unit: '0-100' },
  { id: 'C4', name: 'Rischio', type: 'cost', weight: 8, unit: '0-100' },
  { id: 'C5', name: 'Time-to-Benefit', type: 'cost', weight: 7, unit: 'settimane' },
  { id: 'C6', name: 'Usabilità/UX', type: 'benefit', weight: 8, unit: '0-100' },
  { id: 'C7', name: 'Compatibilità', type: 'benefit', weight: 6, unit: '0-100' },
  { id: 'C8', name: 'Scalabilità', type: 'benefit', weight: 6, unit: '0-100' },
  { id: 'C9', name: 'Sostenibilità', type: 'benefit', weight: 4, unit: 'kWh/anno' },
  { id: 'C10', name: 'Compliance/Privacy', type: 'benefit', weight: 6, unit: '0-100' },
  { id: 'C11', name: 'Ecosistema/Supporto', type: 'benefit', weight: 5, unit: '0-100' },
  { id: 'C12', name: 'Reversibilità/Lock-in', type: 'cost', weight: 7, unit: '€' }
];

// Problem Families (15 families) - V15+ with Acquisto Nuova Vettura
const PROBLEM_FAMILIES = [
  {
    id: '1_investimento_industriale',
    nome: 'Investimento Industriale / CAPEX',
    descrizione: 'Investimenti in linee produttive, macchinari, automazione industriale',
    emoji: '🏭',
    color: '#D7BCCB',
    examples: ['Nuova linea produttiva', 'Automazione processo', 'Upgrade macchinari'],
    extraCriteria: [
      { id: 'E1', name: 'Costo investimento', type: 'cost', weight: 10, unit: '€', description: 'Importo totale investimento iniziale CAPEX' },
      { id: 'E2', name: 'Complessità realizzazione', type: 'cost', weight: 7, unit: '0-100', description: '100=molto complesso (rischio), 0=semplice' },
      { id: 'E3', name: 'Tempo di realizzazione', type: 'cost', weight: 6, unit: 'mesi', description: 'Durata fino a operativo. Più tempo = più ritardo benefici' },
      { id: 'E4', name: 'Saving atteso', type: 'benefit', weight: 14, unit: '€/anno', description: 'Risparmio annuale atteso da efficienza/produttività' },
      { id: 'E5', name: 'Costi fissi operatori', type: 'cost', weight: 9, unit: '€/anno', description: 'Numero operatori × Costo operatore annuo' },
      { id: 'E6', name: 'Affidabilità fornitore', type: 'benefit', weight: 8, unit: '0-100', description: 'Track record: on-time, qualità, supporto' },
      { id: 'E7', name: 'Maturità tecnologia globale', type: 'benefit', weight: 8, unit: '0-100 TRL', description: 'Technology Readiness Level: 0=concetto, 100=produzione' },
      { id: 'E8', name: 'Maturità conoscenza interna', type: 'benefit', weight: 7, unit: '0-100', description: 'Esperienza team: 0=nuovo, 100=consolidato' },
      { id: 'E9', name: 'Sicurezza impianto', type: 'benefit', weight: 8, unit: '0-100', description: 'Conformità safety, protezioni, certificazioni' },
      { id: 'E10', name: 'Costo manutenzione', type: 'cost', weight: 7, unit: '€/anno', description: 'Costi annuali manutenzione programmata e straordinaria' },
      { id: 'E11', name: 'Frequenza manutenzione', type: 'cost', weight: 5, unit: 'ore/anno', description: 'Ore fermo impianto per manutenzione. Alto = svantaggio' },
      { id: 'E12', name: 'Efficienza energetica', type: 'benefit', weight: 6, unit: '0-100', description: '100=basso consumo, 0=alto consumo' },
      { id: 'E13', name: 'Capacità produttiva', type: 'benefit', weight: 9, unit: 'unit/h', description: 'Throughput massimo: più alto = più produttività' },
      { id: 'E14', name: 'Efficienza attesa', type: 'benefit', weight: 7, unit: '0-100%', description: 'OEE atteso: 85%+ è eccellente' }
    ],
    suggestedAlternatives: ['Soluzione A', 'Soluzione B', 'Soluzione C', 'Status quo']
  },
  {
    id: '1b_acquisto_nuova_vettura',
    nome: 'Acquisto Nuova Vettura',
    descrizione: 'Selezione e acquisto di un nuovo veicolo (auto, moto, commerciale)',
    emoji: '🚗',
    color: '#4A90E2',
    examples: ['Confronto modelli auto', 'Elettrica vs ibrida vs benzina', 'Auto aziendale', 'Valutazione sicurezza e costi'],
    extraCriteria: [
      { id: 'E1', name: 'Costo', type: 'cost', weight: 20, unit: '€', description: 'Prezzo di acquisto del veicolo' },
      { id: 'E2', name: 'Sicurezza (attiva+passiva)', type: 'benefit', weight: 18, unit: '0-100', description: 'Sistema di sicurezza attivo e passivo, rating NCAP' },
      { id: 'E3', name: 'Praticità & Spazio interno', type: 'benefit', weight: 12, unit: '0-100', description: 'Spazio interno, bagagliaio, praticità d\'uso' },
      { id: 'E4', name: 'Comfort', type: 'benefit', weight: 10, unit: '0-100', description: 'Comodità sedili, climatizzazione, insonorizzazione' },
      { id: 'E5', name: 'Prestazioni', type: 'benefit', weight: 8, unit: '0-100', description: 'Accelerazione, velocità massima, dinamica' },
      { id: 'E6', name: 'Consumi', type: 'benefit', weight: 8, unit: 'km/l', description: 'Efficienza del carburante (km/l o kWh/100km)' },
      { id: 'E7', name: 'Tecnologia', type: 'benefit', weight: 7, unit: '0-100', description: 'Infotainment, connettività, sistemi avanzati' },
      { id: 'E8', name: 'Ambiente & Accesso', type: 'benefit', weight: 7, unit: '0-100', description: 'Emissioni CO2, accesso alle zone ZTL/LEZ' },
      { id: 'E9', name: 'Affidabilità BRAND, Garanzia & Rete', type: 'benefit', weight: 6, unit: '0-100', description: 'Reputazione brand, copertura garanzia, rete assistenza' },
      { id: 'E10', name: 'Costo Carburante/Ricarica', type: 'cost', weight: 3, unit: '€/100km', description: 'Costo operativo del carburante o ricarica' },
      { id: 'E11', name: 'Rivendibilità (Valore residuo)', type: 'benefit', weight: 1, unit: '%', description: 'Valore residuo dopo N anni' }
    ],
    suggestedAlternatives: ['Tesla Model 3', 'BMW i4', 'Mercedes EQE', 'Audi e-tron GT']
  },
  {
    id: '2_acquisti_investimenti',
    nome: 'Acquisti ad Alto Valore / Investimenti',
    descrizione: 'Casa, auto, macchinari, strumenti, portafogli finanziari',
    emoji: '🏠',
    color: '#2E86AB',
    examples: ['Scegliere quale auto comprare', 'Decidere se investire in immobili', 'Acquistare macchinari per azienda'],
    extraCriteria: [
      { id: 'E1', name: 'Valore residuo', type: 'benefit', weight: 8, unit: '%' },
      { id: 'E2', name: 'Liquidità rivendita', type: 'benefit', weight: 6, unit: 'giorni' },
      { id: 'E3', name: 'Costi ricorrenti', type: 'cost', weight: 10, unit: '€/anno' },
      { id: 'E4', name: 'Affidabilità brand', type: 'benefit', weight: 8, unit: '0-100' },
      { id: 'E5', name: 'Disponibilità/Lead time', type: 'benefit', weight: 5, unit: 'giorni' },
      { id: 'E6', name: 'Comfort/Qualità', type: 'benefit', weight: 8, unit: '0-100' }
    ],
    suggestedAlternatives: ['Premium', 'Mid-range', 'Budget', 'Usato certificato']
  },
  {
    id: '3_upgrade_tecnologia',
    nome: 'Upgrade o Cambio Tecnologia',
    descrizione: 'Smartphone/PC/software/auto elettrica/tecnologia produttiva',
    emoji: '📱',
    color: '#6A4C93',
    examples: ['Aggiornare smartphone', 'Cambiare software aziendale', 'Passare a auto elettrica'],
    extraCriteria: [
      { id: 'E1', name: 'Prestazioni chiave', type: 'benefit', weight: 15, unit: 'benchmark' },
      { id: 'E2', name: 'Migrazione dati', type: 'cost', weight: 8, unit: 'ore' },
      { id: 'E3', name: 'Curva apprendimento', type: 'cost', weight: 10, unit: 'ore' },
      { id: 'E4', name: 'Compatibilità retro', type: 'benefit', weight: 7, unit: '0-100' },
      { id: 'E5', name: 'Sicurezza/Privacy', type: 'benefit', weight: 12, unit: '0-100' },
      { id: 'E6', name: 'Ciclo aggiornamenti', type: 'benefit', weight: 8, unit: 'anni' }
    ],
    suggestedAlternatives: ['Ultimo modello', 'Modello precedente', 'Alternativa open source', 'Mantenere attuale']
  },
  {
    id: '4_carriera_lavoro',
    nome: 'Carriera e Lavoro',
    descrizione: 'Cambiare ruolo/azienda, freelance, relocation',
    emoji: '💼',
    color: '#A23B72',
    examples: ['Scegliere tra più offerte di lavoro', 'Decidere se passare a freelance', 'Valutare trasferimento in altra città'],
    extraCriteria: [
      { id: 'E1', name: 'Retribuzione totale', type: 'benefit', weight: 20, unit: '€/anno' },
      { id: 'E2', name: 'Traiettoria crescita', type: 'benefit', weight: 18, unit: '0-100' },
      { id: 'E3', name: 'Fit culturale', type: 'benefit', weight: 18, unit: '0-100' },
      { id: 'E4', name: 'Work-Life balance', type: 'benefit', weight: 15, unit: '0-100' },
      { id: 'E5', name: 'Stabilità azienda', type: 'cost', weight: 12, unit: '0-100' },
      { id: 'E6', name: 'Commuting/Remote', type: 'cost', weight: 5, unit: 'min/giorno' },
      { id: 'E7', name: 'Formazione', type: 'benefit', weight: 4, unit: 'ore/anno' }
    ],
    suggestedAlternatives: ['Software Engineer', 'Data Scientist', 'Product Manager', 'Freelance', 'Startup']
  },
  {
    id: '5_formazione_sviluppo',
    nome: 'Formazione e Sviluppo',
    descrizione: 'Lauree, master, certificazioni, coaching',
    emoji: '🎓',
    color: '#F18F01',
    examples: ['Scegliere un master', 'Certificazione professionale', 'Corso online vs presenza'],
    extraCriteria: [
      { id: 'E1', name: 'Qualità istituto', type: 'benefit', weight: 18, unit: 'ranking' },
      { id: 'E2', name: 'Reputazione certificazione', type: 'benefit', weight: 15, unit: '0-100' },
      { id: 'E3', name: 'Impegno tempo', type: 'cost', weight: 12, unit: 'ore/settimana' },
      { id: 'E4', name: 'ROI salariale atteso', type: 'benefit', weight: 20, unit: '% aumento' },
      { id: 'E5', name: 'Flessibilità didattica', type: 'benefit', weight: 10, unit: '0-100' },
      { id: 'E6', name: 'Prerequisiti gap', type: 'cost', weight: 5, unit: '0-100' }
    ],
    suggestedAlternatives: ['MBA', 'Master specialistico', 'Certificazione online', 'Bootcamp intensivo']
  },
  {
    id: '6_finanze_personali',
    nome: 'Finanze Personali/Aziendali',
    descrizione: 'Budget, mutuo vs affitto, rifinanziamento',
    emoji: '💰',
    color: '#C73E1D',
    examples: ['Scegliere tra mutuo e affitto', 'Rifinanziamento di prestito', 'Leasing vs acquisto'],
    extraCriteria: [
      { id: 'E1', name: 'Tasso/TAEG', type: 'cost', weight: 18, unit: '%' },
      { id: 'E2', name: 'Rata mensile', type: 'cost', weight: 15, unit: '€/mese' },
      { id: 'E3', name: 'Durata contratto', type: 'cost', weight: 10, unit: 'mesi' },
      { id: 'E4', name: 'Rischio tasso', type: 'cost', weight: 12, unit: '0-100' },
      { id: 'E5', name: 'Beneficio fiscale', type: 'benefit', weight: 12, unit: '€' },
      { id: 'E6', name: 'Liquidità/Buffer', type: 'benefit', weight: 10, unit: 'mesi' }
    ],
    suggestedAlternatives: ['Mutuo fisso', 'Mutuo variabile', 'Affitto', 'Leasing']
  },
  {
    id: '7_salute_benessere',
    nome: 'Salute e Benessere',
    descrizione: 'Piani sanitari, terapie, dieta/allenamento',
    emoji: '⚕️',
    color: '#52B788',
    examples: ['Scegliere piano sanitario', 'Valutare terapie alternative', 'Piano fitness personalizzato'],
    extraCriteria: [
      { id: 'E1', name: 'Efficacia attesa', type: 'benefit', weight: 25, unit: '0-100' },
      { id: 'E2', name: 'Effetti collaterali', type: 'cost', weight: 15, unit: '0-100' },
      { id: 'E3', name: 'Aderenza personale', type: 'benefit', weight: 12, unit: '0-100' },
      { id: 'E4', name: 'Tempo a risultato', type: 'cost', weight: 10, unit: 'settimane' },
      { id: 'E5', name: 'Costi out-of-pocket', type: 'cost', weight: 12, unit: '€/mese' },
      { id: 'E6', name: 'Impatto qualità vita', type: 'benefit', weight: 18, unit: '0-100' }
    ],
    suggestedAlternatives: ['Piano premium', 'Piano base', 'Alternativa naturale', 'Status quo']
  },
  {
    id: '8_relazioni_famiglia',
    nome: 'Relazioni e Famiglia',
    descrizione: 'Convivenza, figli, gestione conflitti, caregiving',
    emoji: '❤️',
    color: '#E63946',
    examples: ['Decisioni su convivenza', 'Gestione caregiving genitori', 'Scelte familiari importanti'],
    extraCriteria: [
      { id: 'E1', name: 'Allineamento obiettivi', type: 'benefit', weight: 22, unit: '0-100' },
      { id: 'E2', name: 'Comunicazione efficace', type: 'benefit', weight: 20, unit: '0-100' },
      { id: 'E3', name: 'Stabilità economica', type: 'benefit', weight: 15, unit: '0-100' },
      { id: 'E4', name: 'Carico mentale/tempo', type: 'cost', weight: 12, unit: 'ore/settimana' },
      { id: 'E5', name: 'Rete di supporto', type: 'benefit', weight: 15, unit: '0-100' },
      { id: 'E6', name: 'Reversibilità legale', type: 'cost', weight: 8, unit: '€' }
    ],
    suggestedAlternatives: ['Opzione A', 'Opzione B', 'Status quo', 'Soluzione ibrida']
  },
  {
    id: '9_residenza_mobilita',
    nome: 'Residenza e Mobilità',
    descrizione: 'Dove vivere, trasloco, mezzo di trasporto',
    emoji: '🏙️',
    color: '#457B9D',
    examples: ['Scegliere città dove vivere', 'Quartiere per casa', 'Auto vs trasporto pubblico'],
    extraCriteria: [
      { id: 'E1', name: 'Distanza luoghi chiave', type: 'cost', weight: 15, unit: 'minuti' },
      { id: 'E2', name: 'Qualità quartiere', type: 'benefit', weight: 18, unit: '0-100' },
      { id: 'E3', name: 'Qualità scuola', type: 'benefit', weight: 12, unit: '0-100' },
      { id: 'E4', name: 'Inquinamento/rumore', type: 'cost', weight: 10, unit: '0-100' },
      { id: 'E5', name: 'Costi trasloco', type: 'cost', weight: 8, unit: '€' },
      { id: 'E6', name: 'Accessibilità servizi', type: 'benefit', weight: 15, unit: '0-100' }
    ],
    suggestedAlternatives: ['Città A', 'Città B', 'Periferia', 'Centro città']
  },
  {
    id: '10_gestione_tempo',
    nome: 'Gestione del Tempo e Priorità',
    descrizione: 'Delegare, esternalizzare, OKR',
    emoji: '⏱️',
    color: '#8E44AD',
    examples: ['Decidere cosa delegare', 'Esternalizzare vs fare internamente', 'Priorità progetti'],
    extraCriteria: [
      { id: 'E1', name: 'Tempo liberato', type: 'benefit', weight: 25, unit: 'ore/settimana' },
      { id: 'E2', name: 'Valore del tempo', type: 'benefit', weight: 15, unit: '€/ora' },
      { id: 'E3', name: 'Qualità output', type: 'benefit', weight: 20, unit: '0-100' },
      { id: 'E4', name: 'Rischio dipendenza', type: 'cost', weight: 12, unit: '0-100' },
      { id: 'E5', name: 'Complessità coordinamento', type: 'cost', weight: 10, unit: '0-100' }
    ],
    suggestedAlternatives: ['Fare internamente', 'Delegare team', 'Esternalizzare', 'Automatizzare']
  },
  {
    id: '11_viaggi_tempo_libero',
    nome: 'Viaggi e Tempo Libero',
    descrizione: 'Meta, periodo, assicurazione',
    emoji: '✈️',
    color: '#06A77D',
    examples: ['Scegliere meta vacanze', 'Periodo migliore per viaggio', 'Tipo di esperienza viaggio'],
    extraCriteria: [
      { id: 'E1', name: 'Esperienza/Attrattività', type: 'benefit', weight: 25, unit: '0-100' },
      { id: 'E2', name: 'Costo totale', type: 'cost', weight: 20, unit: '€' },
      { id: 'E3', name: 'Tempo viaggio/Scali', type: 'cost', weight: 12, unit: 'ore' },
      { id: 'E4', name: 'Rischi viaggio', type: 'cost', weight: 15, unit: '0-100' },
      { id: 'E5', name: 'Flessibilità', type: 'benefit', weight: 10, unit: '0-100' }
    ],
    suggestedAlternatives: ['Destinazione A', 'Destinazione B', 'Viaggio avventura', 'Relax']
  },
  {
    id: '12_fornitori_outsourcing',
    nome: 'Selezione Fornitori & Outsourcing (B2B)',
    descrizione: 'Vendor selection, partnership, outsourcing',
    emoji: '🤝',
    color: '#2D6A4F',
    examples: ['Scegliere fornitore materie prime', 'Outsourcing IT', 'Partnership strategica'],
    extraCriteria: [
      { id: 'E1', name: 'Prezzo unitario', type: 'cost', weight: 18, unit: '€/unità' },
      { id: 'E2', name: 'SLA & penali', type: 'benefit', weight: 15, unit: '0-100' },
      { id: 'E3', name: 'Qualità storica', type: 'benefit', weight: 18, unit: 'PPM/OTIF' },
      { id: 'E4', name: 'Capacità/Scalabilità', type: 'benefit', weight: 12, unit: '0-100' },
      { id: 'E5', name: 'Rischio fornitore', type: 'cost', weight: 12, unit: '0-100' },
      { id: 'E6', name: 'Lead time logistica', type: 'cost', weight: 8, unit: 'giorni' }
    ],
    suggestedAlternatives: ['Fornitore A', 'Fornitore B', 'Fornitore locale', 'Fornitore globale']
  },
  {
    id: '13_rischi_compliance',
    nome: 'Rischi, Compliance e Sicurezza',
    descrizione: 'Gestione rischi, conformità normativa',
    emoji: '🛡️',
    color: '#9B59B6',
    examples: ['Scegliere misura di sicurezza', 'Conformità GDPR', 'Risk mitigation strategy'],
    extraCriteria: [
      { id: 'E1', name: 'Coverage normativa', type: 'benefit', weight: 20, unit: '0-100' },
      { id: 'E2', name: 'Probabilità evento', type: 'cost', weight: 18, unit: '0-100' },
      { id: 'E3', name: 'Impatto evento', type: 'cost', weight: 20, unit: '0-100' },
      { id: 'E4', name: 'Costo mitigazione', type: 'cost', weight: 15, unit: '€' },
      { id: 'E5', name: 'Residual risk', type: 'cost', weight: 15, unit: '0-100' }
    ],
    suggestedAlternatives: ['Misura A', 'Misura B', 'Combinazione', 'Accettare rischio']
  },
  {
    id: '14_sostenibilita_energia',
    nome: 'Sostenibilità & Energia',
    descrizione: 'Efficienza, rinnovabili, packaging, ESG',
    emoji: '🌱',
    color: '#27AE60',
    examples: ['Passare a energia rinnovabile', 'Efficientamento energetico', 'Riduzione carbon footprint'],
    extraCriteria: [
      { id: 'E1', name: 'Consumo energetico', type: 'cost', weight: 18, unit: 'kWh/anno' },
      { id: 'E2', name: 'Emissioni CO2', type: 'cost', weight: 20, unit: 'kgCO2e/anno' },
      { id: 'E3', name: '% rinnovabile', type: 'benefit', weight: 15, unit: '%' },
      { id: 'E4', name: 'CapEx green', type: 'cost', weight: 12, unit: '€' },
      { id: 'E5', name: 'Payback energetico', type: 'cost', weight: 12, unit: 'anni' },
      { id: 'E6', name: 'Impatti non-energetici', type: 'cost', weight: 10, unit: '0-100' }
    ],
    suggestedAlternatives: ['Solare', 'Eolico', 'Efficientamento', 'Mix energetico']
  }
];

// Application object
const app = {
  // Initialize
  init() {
    this.showScreen('welcome-screen');
  },

  // Go to family selection
  goToFamilySelection() {
    this.renderFamilies();
    this.showScreen('family-screen');
  },

  // Render families
  renderFamilies() {
    const grid = document.getElementById('families-grid');
    grid.innerHTML = '';
    
    PROBLEM_FAMILIES.forEach(family => {
      const card = document.createElement('div');
      card.className = 'family-card';
      card.dataset.familyId = family.id;
      card.style.setProperty('--family-color', family.color);
      
      const examplesHtml = family.examples.map(ex => `<li>${ex}</li>`).join('');
      
      card.innerHTML = `
        <span class="family-emoji">${family.emoji}</span>
        <div class="family-name">${family.nome}</div>
        <div class="family-description">${family.descrizione}</div>
        <ul class="family-examples">${examplesHtml}</ul>
        <button class="btn btn--primary family-card-btn" onclick="app.selectFamily('${family.id}')">Seleziona</button>
      `;
      
      grid.appendChild(card);
    });
  },

  // Filter families
  filterFamilies() {
    const search = document.getElementById('family-search').value.toLowerCase();
    document.querySelectorAll('.family-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.classList.toggle('hidden', !text.includes(search));
    });
  },

  // Select family
  selectFamily(familyId) {
    const family = PROBLEM_FAMILIES.find(f => f.id === familyId);
    if (!family) return;
    
    state.selectedFamily = family;
    
    // V15+ CHANGE: Load ONLY family-specific extraCriteria (NO core criteria)
    state.criteria = family.extraCriteria.map(c => ({
      ...c,
      isCore: false,
      isIncluded: true,  // All enabled by default
      locked: false,
      source: 'extra'
    }));
    
    // Reset custom criteria
    state.customCriteria = [];
    
    // Show step 1
    this.showScreen('step1-screen');
    this.updateFamilyBadges();
    this.renderContextQuestions();
  },

  // Update family badges across screens
  updateFamilyBadges() {
    if (!state.selectedFamily) return;
    
    const badges = document.querySelectorAll('[id^="family-badge"]');
    badges.forEach(badge => {
      badge.innerHTML = `<span class="family-badge-emoji">${state.selectedFamily.emoji}</span> ${state.selectedFamily.nome}`;
      badge.className = 'family-badge';
    });
  },

  // Render context questions
  renderContextQuestions() {
    const container = document.getElementById('context-questions');
    if (!state.selectedFamily) {
      container.innerHTML = '';
      return;
    }
    
    // Family-specific context questions
    let questionsHtml = '';
    
    if (state.selectedFamily.id === '4_carriera_lavoro') {
      questionsHtml = `
        <div class="form-group">
          <label class="form-label">Ruolo attuale</label>
          <input type="text" class="form-control" id="context-current-role" placeholder="es. Software Engineer">
        </div>
        <div class="form-group">
          <label class="form-label">Livello seniority desiderato</label>
          <select class="form-control" id="context-seniority">
            <option value="Junior">Junior</option>
            <option value="Mid">Mid-level</option>
            <option value="Senior" selected>Senior</option>
            <option value="Lead">Lead/Principal</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
      `;
    } else if (state.selectedFamily.id === '2_acquisti_investimenti') {
      questionsHtml = `
        <div class="form-group">
          <label class="form-label">Intenzione di rivendita?</label>
          <select class="form-control" id="context-resale">
            <option value="yes">Sì, prevedo di rivendere</option>
            <option value="no" selected>No, uso a lungo termine</option>
          </select>
        </div>
      `;
    }
    
    container.innerHTML = questionsHtml;
  },

  // Navigation
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  },

  startNewDecision() {
    // Reset state
    state.selectedFamily = null;
    state.problem = { title: '', timeHorizon: 0, budgetCap: 0, contextData: {}, importanceLevel: 5 };
    state.alternatives = [];
    state.criteria = [];
    state.customCriteria = [];
    state.performanceMatrix = [];
    state.preferences = { riskTolerance: 5, confidenceLevel: 'Medium', constraints: '' };
    state.results = null;
    state.isCalculating = false;
    state.calculationProgress = 0;
    state.calculationError = null;
    
    this.goToFamilySelection();
  },

  goToWelcome() {
    this.showScreen('welcome-screen');
  },

  // Example data loader (V15+ compatible)
  loadExample() {
    // Preload family and defaults (Career)
    this.renderFamilies();
    this.selectFamily('4_carriera_lavoro');

    state.problem = {
      title: 'Scegli un Percorso di Carriera',
      timeHorizon: 5,
      budgetCap: 0,
      contextData: { currentRole: 'Software Engineer', seniority: 'Senior' },
      importanceLevel: 9
    };

    state.alternatives = [
      { id: 1, name: 'Software Engineer', description: 'Sviluppo prodotti software, sfide tecniche, buona retribuzione' },
      { id: 2, name: 'Data Scientist', description: 'Analisi dati, machine learning, alto potenziale di crescita' },
      { id: 3, name: 'Product Manager', description: 'Strategia prodotto, collaborazione cross-funzionale' }
    ];

    // V15+: Initialize performance matrix with mid values (only family-specific criteria)
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    state.performanceMatrix = state.alternatives.map(() => activeCriteria.map(() => 5));

    // Populate Step 1 UI
    document.getElementById('problem-title').value = state.problem.title;
    document.getElementById('time-horizon').value = state.problem.timeHorizon;
    document.getElementById('budget-cap').value = state.problem.budgetCap;
    document.getElementById('importance-level').value = state.problem.importanceLevel;
    document.getElementById('importance-value').textContent = state.problem.importanceLevel;

    this.updateFamilyBadges();
    this.renderAlternatives();
    this.renderCriteriaEnhanced();
    this.showScreen('step1-screen');
  },

  // Step Navigation
  nextStep(currentStep) {
    if (currentStep === 1) {
      // Validate step 1
      const title = document.getElementById('problem-title').value.trim();
      const timeHorizon = parseFloat(document.getElementById('time-horizon').value) || 0;
      
      if (!title || timeHorizon <= 0) {
        alert('Per favore compila tutti i campi obbligatori');
        return;
      }

      state.problem.title = title;
      state.problem.timeHorizon = timeHorizon;
      state.problem.budgetCap = parseFloat(document.getElementById('budget-cap').value) || 0;
      state.problem.importanceLevel = parseInt(document.getElementById('importance-level').value);

      this.updateFamilyBadges();
      this.renderAlternatives();
      this.showScreen('step2-screen');
    }
    else if (currentStep === 2) {
      // Validate step 2
      this.collectAlternatives();
      
      // Filter out empty alternatives
      state.alternatives = state.alternatives.filter(alt => alt.name.trim() !== '');
      
      if (state.alternatives.length < 2) {
        alert('Devi definire almeno 2 alternative');
        return;
      }
      if (state.alternatives.length > 10) {
        alert('Massimo 10 alternative consentite');
        return;
      }

      this.updateFamilyBadges();
      this.renderCriteriaEnhanced();
      this.showScreen('step3-screen');
    }
    else if (currentStep === 3) {
      // Validate step 3
      this.collectCriteriaEnhanced();
      
      const activeCriteria = state.criteria.filter(c => c.isIncluded);
      if (activeCriteria.length < 1) {
        alert('Devi avere almeno 1 criterio attivo');
        return;
      }
      
      const totalWeight = activeCriteria.reduce((sum, c) => sum + c.weight, 0);
      if (Math.abs(totalWeight - 100) > 0.5) {
        alert(`I pesi devono sommare a 100%. Attualmente: ${totalWeight.toFixed(1)}%\n\nUsa il pulsante "Bilancia Pesi Automaticamente" per correggere.`);
        return;
      }

      this.updateFamilyBadges();
      this.renderPerformanceMatrix();
      this.showScreen('step4-screen');
    }
    else if (currentStep === 4) {
      // Validate step 4
      this.collectPerformanceMatrix();
      
      // Check all cells are filled
      for (let i = 0; i < state.performanceMatrix.length; i++) {
        for (let j = 0; j < state.performanceMatrix[i].length; j++) {
          if (state.performanceMatrix[i][j] < 1 || state.performanceMatrix[i][j] > 10) {
            alert('Tutti i valori devono essere compresi tra 1 e 10');
            return;
          }
        }
      }

      this.showScreen('step5-screen');
    }
  },

  previousStep(currentStep) {
    if (currentStep === 2) {
      this.showScreen('step1-screen');
    } else if (currentStep === 3) {
      this.renderAlternatives();
      this.showScreen('step2-screen');
    } else if (currentStep === 4) {
      this.renderCriteria();
      this.showScreen('step3-screen');
    } else if (currentStep === 5) {
      this.renderPerformanceMatrix();
      this.showScreen('step4-screen');
    }
  },

  // Show suggested alternatives
  renderAlternativeSuggestions() {
    const container = document.getElementById('alt-suggestions');
    if (!state.selectedFamily || !state.selectedFamily.suggestedAlternatives) {
      container.innerHTML = '';
      return;
    }
    
    container.innerHTML = `
      <div style="margin-bottom: 16px; padding: 12px; background: var(--color-bg-2); border-radius: var(--radius-base);">
        <strong>Suggerimenti per questa famiglia:</strong> ${state.selectedFamily.suggestedAlternatives.join(', ')}
      </div>
    `;
  },

  addSuggestedAlternatives() {
    if (!state.selectedFamily || !state.selectedFamily.suggestedAlternatives) return;
    
    // Clear existing
    state.alternatives = [];
    
    // Add suggested
    state.selectedFamily.suggestedAlternatives.slice(0, 4).forEach(name => {
      state.alternatives.push({
        id: Date.now() + Math.random(),
        name: name,
        description: ''
      });
    });
    
    this.renderAlternatives();
  },

  // Step 2: Alternatives
  renderAlternatives() {
    this.updateFamilyBadges();
    this.renderAlternativeSuggestions();
    const list = document.getElementById('alternatives-list');
    list.innerHTML = '';
    
    state.alternatives.forEach((alt, index) => {
      const item = document.createElement('div');
      item.className = 'alt-item';
      item.innerHTML = `
        <div class="item-header">
          <span class="item-number">Alternativa ${index + 1}</span>
          <button class="btn-remove" onclick="app.removeAlternative(${index})">Rimuovi</button>
        </div>
        <div class="form-group">
          <input type="text" class="form-control" placeholder="Nome alternativa" value="${alt.name}" data-alt-index="${index}" data-field="name">
        </div>
        <div class="form-group">
          <textarea class="form-control" placeholder="Descrizione breve" data-alt-index="${index}" data-field="description">${alt.description}</textarea>
        </div>
      `;
      list.appendChild(item);
    });

    document.getElementById('alt-count').textContent = state.alternatives.length;
    
    // Enable/disable add button
    const addBtn = document.getElementById('add-alt-btn');
    addBtn.disabled = state.alternatives.length >= 10;
  },

  addAlternative() {
    if (state.alternatives.length >= 10) return;
    
    state.alternatives.push({
      id: Date.now(),
      name: '',
      description: ''
    });
    
    this.renderAlternatives();
  },

  removeAlternative(index) {
    state.alternatives.splice(index, 1);
    this.renderAlternatives();
  },

  collectAlternatives() {
    document.querySelectorAll('#alternatives-list input, #alternatives-list textarea').forEach(input => {
      const index = parseInt(input.dataset.altIndex);
      const field = input.dataset.field;
      state.alternatives[index][field] = input.value.trim();
    });
  },

  // Step 3: Enhanced Criteria (V15+: Family-Specific Only)
  renderCriteriaEnhanced() {
    this.updateFamilyBadges();
    // V15+: No core criteria, only family-specific
    this.renderFamilySpecificCriteria();
    this.updateWeightSumEnhanced();
  },

  // V15+: Render ONLY family-specific criteria (no core criteria)
  renderFamilySpecificCriteria() {
    const extraList = document.getElementById('extra-criteria-list');
    const familyLabel = document.getElementById('family-specific-label');
    const familyNameStep3 = document.getElementById('family-name-step3');
    
    if (state.selectedFamily) {
      familyLabel.textContent = `(${state.selectedFamily.nome})`;
      if (familyNameStep3) {
        familyNameStep3.innerHTML = `<span style="font-size: 18px;">${state.selectedFamily.emoji}</span> ${state.selectedFamily.nome}`;
      }
    }
    
    extraList.innerHTML = '';
    
    // Get family-specific criteria (exclude custom for now)
    const familyCriteria = state.criteria.filter(c => c.source === 'extra');
    
    familyCriteria.forEach((crit) => {
      const item = document.createElement('div');
      item.className = `crit-item-enhanced extra`;
      
      const typeClass = crit.type === 'benefit' ? 'benefit' : 'cost';
      const typeIcon = crit.type === 'benefit' ? '↑' : '↓';
      const lockIcon = crit.locked ? '🔒' : '🔓';
      const lockClass = crit.locked ? 'locked' : '';
      
      item.innerHTML = `
        <input type="checkbox" class="crit-toggle" ${crit.isIncluded ? 'checked' : ''} data-crit-id="${crit.id}" onchange="app.toggleCriterion('${crit.id}')">
        <span class="crit-name-display">${crit.name}</span>
        <span class="crit-type-badge ${typeClass}">${typeIcon} ${crit.type === 'benefit' ? 'Beneficio' : 'Costo'}</span>
        <input type="number" class="crit-weight-input ${lockClass}" value="${crit.weight}" min="0" max="100" step="0.5" data-crit-id="${crit.id}" oninput="app.onWeightEdit('${crit.id}')" ${!crit.isIncluded ? 'disabled' : ''}>
        <button class="btn-lock" onclick="app.toggleLock('${crit.id}')" ${!crit.isIncluded ? 'disabled' : ''}>${lockIcon}</button>
        <span class="crit-unit">${crit.unit || ''}</span>
      `;
      
      extraList.appendChild(item);
    });
    
    // Render custom criteria section
    this.renderCustomCriteria();
  },



  renderCustomCriteria() {
    const container = document.getElementById('extra-criteria-list');
    
    // Add custom criteria section after extra criteria
    const customCriteria = state.criteria.filter(c => c.source === 'custom');
    
    if (customCriteria.length > 0 || state.criteria.filter(c => c.source === 'custom').length < 5) {
      let customHtml = '<div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid var(--color-border);">';
      customHtml += '<h5 style="font-size: var(--font-size-base); margin-bottom: 12px; color: var(--color-text-secondary);">✏️ Criteri Personalizzati</h5>';
      
      customCriteria.forEach(crit => {
        const typeClass = crit.type === 'benefit' ? 'benefit' : 'cost';
        const typeIcon = crit.type === 'benefit' ? '↑' : '↓';
        const lockIcon = crit.locked ? '🔒' : '🔓';
        const lockClass = crit.locked ? 'locked' : '';
        
        const inputTypeLabel = crit.isNumeric ? '🔢 Numerico' : '📊 Score';
        const numericInfo = crit.isNumeric ? `<div style="font-size: 11px; color: #666; margin-top: 5px;">Range: ${crit.minValue} - ${crit.optimalValue} - ${crit.maxValue}</div>` : '';
        
        customHtml += `
          <div class="crit-item-enhanced" style="background: var(--color-bg-5);">
            <input type="checkbox" class="crit-toggle" ${crit.isIncluded ? 'checked' : ''} data-crit-id="${crit.id}" onchange="app.toggleCriterion('${crit.id}')">
            <div>
              <span class="crit-name-display">✏️ ${crit.name}</span>
              <span style="font-size: 10px; color: #999; margin-left: 8px;">(${inputTypeLabel})</span>
              ${numericInfo}
            </div>
            <span class="crit-type-badge ${typeClass}">${typeIcon} ${crit.type === 'benefit' ? 'Beneficio' : 'Costo'}</span>
            <input type="number" class="crit-weight-input ${lockClass}" value="${crit.weight}" min="0" max="100" step="0.5" data-crit-id="${crit.id}" oninput="app.onWeightEdit('${crit.id}')" ${!crit.isIncluded ? 'disabled' : ''}>
            <button class="btn-lock" onclick="app.toggleLock('${crit.id}')" ${!crit.isIncluded ? 'disabled' : ''}>${lockIcon}</button>
            <button class="btn-remove" onclick="app.removeCustomCriterion('${crit.id}')" style="padding: 4px 8px; font-size: 12px;">Rimuovi</button>
          </div>
        `;
      });
      
      if (customCriteria.length < 5) {
        customHtml += '<button class="btn btn--secondary" onclick="app.showAddCustomCriterionModal()" style="margin-top: 12px;">+ Aggiungi Criterio Personalizzato</button>';
      } else {
        customHtml += '<p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 12px;">Limite massimo di 5 criteri personalizzati raggiunto</p>';
      }
      
      customHtml += '</div>';
      container.insertAdjacentHTML('beforeend', customHtml);
    } else {
      container.insertAdjacentHTML('beforeend', '<div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid var(--color-border);"><button class="btn btn--secondary" onclick="app.showAddCustomCriterionModal()">+ Aggiungi Criterio Personalizzato</button></div>');
    }
  },

  showAddCustomCriterionModal() {
    const modal = document.createElement('div');
    modal.id = 'custom-criterion-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    modal.innerHTML = `
      <div style="background: var(--color-surface); padding: 32px; border-radius: var(--radius-lg); max-width: 500px; width: 90%;">
        <h3 style="margin-bottom: 24px;">Aggiungi Criterio Personalizzato</h3>
        
        <div class="form-group">
          <label class="form-label">Nome Criterio *</label>
          <input type="text" id="custom-crit-name" class="form-control" placeholder="es. Costo Implementazione, Tempo Risparmiato..." maxlength="100">
          <small style="font-size: 11px; color: var(--color-text-secondary);">5-100 caratteri, deve essere univoco</small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Tipo *</label>
          <div style="display: flex; gap: 16px;">
            <label class="checkbox-label" style="flex: 1; padding: 12px; background: var(--color-bg-3); border-radius: var(--radius-base); border: 2px solid transparent;" onclick="document.getElementById('custom-type-benefit').checked = true; this.parentElement.querySelectorAll('label').forEach(l => l.style.borderColor = 'transparent'); this.style.borderColor = 'var(--color-primary)';">
              <input type="radio" name="custom-type" id="custom-type-benefit" value="benefit" checked>
              <span>↑ Beneficio<br><small style="font-size: 10px;">Più alto = migliore</small></span>
            </label>
            <label class="checkbox-label" style="flex: 1; padding: 12px; background: var(--color-bg-4); border-radius: var(--radius-base); border: 2px solid transparent;" onclick="document.getElementById('custom-type-cost').checked = true; this.parentElement.querySelectorAll('label').forEach(l => l.style.borderColor = 'transparent'); this.style.borderColor = 'var(--color-primary)';">
              <input type="radio" name="custom-type" id="custom-type-cost" value="cost">
              <span>↓ Costo<br><small style="font-size: 10px;">Più alto = peggiore</small></span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Tipo Input *</label>
          <div style="display: flex; gap: 16px;">
            <label class="checkbox-label" style="flex: 1; padding: 12px; background: var(--color-bg-1); border-radius: var(--radius-base); border: 2px solid transparent;" onclick="document.getElementById('custom-input-score').checked = true; this.parentElement.querySelectorAll('label').forEach(l => l.style.borderColor = 'transparent'); this.style.borderColor = 'var(--color-primary)'; app.toggleNumericFields(false);">
              <input type="radio" name="custom-input-type" id="custom-input-score" value="score" checked>
              <span>📊 Score (1-10)<br><small style="font-size: 10px;">Valutazione qualitativa</small></span>
            </label>
            <label class="checkbox-label" style="flex: 1; padding: 12px; background: var(--color-bg-2); border-radius: var(--radius-base); border: 2px solid transparent;" onclick="document.getElementById('custom-input-numeric').checked = true; this.parentElement.querySelectorAll('label').forEach(l => l.style.borderColor = 'transparent'); this.style.borderColor = 'var(--color-primary)'; app.toggleNumericFields(true);">
              <input type="radio" name="custom-input-type" id="custom-input-numeric" value="numeric">
              <span>🔢 Numerico<br><small style="font-size: 10px;">Valore reale (€, ore, etc)</small></span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Peso Iniziale: <span id="custom-weight-value">10</span>%</label>
          <input type="range" id="custom-crit-weight" class="slider" min="1" max="20" value="10" oninput="document.getElementById('custom-weight-value').textContent = this.value">
          <small style="font-size: 11px; color: var(--color-text-secondary);">I pesi verranno ribilanciati automaticamente</small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Unità di Misura (opzionale)</label>
          <input type="text" id="custom-crit-unit" class="form-control" placeholder="es. €, %, ore, giorni..." maxlength="20">
        </div>
        
        <div id="numeric-fields-container" style="display: none;">
          <div class="form-group">
            <label class="form-label">Valore Minimo *</label>
            <input type="number" id="custom-crit-min" class="form-control" placeholder="es. 0" step="any">
            <small style="font-size: 11px; color: var(--color-text-secondary);">Valore minimo possibile</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">Valore Ottimale *</label>
            <input type="number" id="custom-crit-optimal" class="form-control" placeholder="es. 50000" step="any">
            <small style="font-size: 11px; color: var(--color-text-secondary);">Valore target/ottimale di riferimento</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">Valore Massimo *</label>
            <input type="number" id="custom-crit-max" class="form-control" placeholder="es. 500000" step="any">
            <small style="font-size: 11px; color: var(--color-text-secondary);">Valore massimo possibile</small>
          </div>
          
          <div style="padding: 12px; background: var(--color-bg-1); border-radius: var(--radius-base); margin-bottom: 16px;">
            <strong style="font-size: 12px;">💡 Formula Conversione:</strong>
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 8px;">
              <strong>Beneficio:</strong> Score = (valore - min) / (max - min) × 100<br>
              <strong>Costo:</strong> Score = (max - valore) / (max - min) × 100
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button class="btn btn--primary" onclick="app.addCustomCriterion()" style="flex: 1;">Aggiungi</button>
          <button class="btn btn--secondary" onclick="app.closeCustomCriterionModal()" style="flex: 1;">Annulla</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('custom-crit-name').focus();
  },

  toggleNumericFields(show) {
    const container = document.getElementById('numeric-fields-container');
    if (container) {
      container.style.display = show ? 'block' : 'none';
    }
  },

  addCustomCriterion() {
    const name = document.getElementById('custom-crit-name').value.trim();
    const type = document.querySelector('input[name="custom-type"]:checked').value;
    const inputType = document.querySelector('input[name="custom-input-type"]:checked').value;
    const weight = parseFloat(document.getElementById('custom-crit-weight').value);
    const unit = document.getElementById('custom-crit-unit').value.trim();
    
    // Validation
    if (!name || name.length < 5 || name.length > 100) {
      alert('Il nome deve essere tra 5 e 100 caratteri');
      return;
    }
    
    // Check uniqueness
    const exists = state.criteria.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert('Esiste già un criterio con questo nome');
      return;
    }
    
    // Check max custom criteria
    const customCount = state.criteria.filter(c => c.source === 'custom').length;
    if (customCount >= 5) {
      alert('Massimo 5 criteri personalizzati');
      return;
    }
    
    // Validation for numeric criteria
    if (inputType === 'numeric') {
      const minValue = parseFloat(document.getElementById('custom-crit-min').value);
      const optimalValue = parseFloat(document.getElementById('custom-crit-optimal').value);
      const maxValue = parseFloat(document.getElementById('custom-crit-max').value);
      
      if (isNaN(minValue) || isNaN(optimalValue) || isNaN(maxValue)) {
        alert('❌ Per criteri numerici devi specificare min, ottimale e max');
        return;
      }
      
      if (minValue >= optimalValue || optimalValue >= maxValue) {
        alert('❌ Valori non validi: deve essere min < ottimale < max');
        return;
      }
    }
    
    // Add custom criterion
    const newCrit = {
      id: 'CUSTOM_' + Date.now(),
      name: name,
      type: type,
      weight: weight,
      unit: unit,
      isCore: false,
      isIncluded: true,
      locked: false,
      source: 'custom',
      inputType: inputType,
      isNumeric: (inputType === 'numeric'),
      description: 'Criterio personalizzato'
    };
    
    // Add numeric-specific fields
    if (inputType === 'numeric') {
      newCrit.minValue = parseFloat(document.getElementById('custom-crit-min').value);
      newCrit.optimalValue = parseFloat(document.getElementById('custom-crit-optimal').value);
      newCrit.maxValue = parseFloat(document.getElementById('custom-crit-max').value);
    }
    
    state.criteria.push(newCrit);
    
    this.closeCustomCriterionModal();
    this.renderCriteriaEnhanced();
  },

  removeCustomCriterion(critId) {
    if (!confirm('Sei sicuro di voler rimuovere questo criterio personalizzato?')) return;
    
    const index = state.criteria.findIndex(c => c.id === critId);
    if (index > -1) {
      state.criteria.splice(index, 1);
      this.renderCriteriaEnhanced();
    }
  },

  closeCustomCriterionModal() {
    const modal = document.getElementById('custom-criterion-modal');
    if (modal) modal.remove();
  },

  toggleCriterion(critId) {
    const crit = state.criteria.find(c => c.id === critId);
    if (crit) {
      crit.isIncluded = !crit.isIncluded;
      
      // Enable/disable weight input
      const weightInput = document.querySelector(`input.crit-weight-input[data-crit-id="${critId}"]`);
      if (weightInput) {
        weightInput.disabled = !crit.isIncluded;
      }
      
      this.updateWeightSumEnhanced();
    }
  },

  onWeightEdit(critId) {
    const crit = state.criteria.find(c => c.id === critId);
    if (crit) {
      const input = document.querySelector(`input.crit-weight-input[data-crit-id="${critId}"]`);
      crit.weight = parseFloat(input.value) || 0;
      crit.locked = true; // Auto-lock when user edits
    }
    this.updateWeightSumEnhanced();
    this.renderCriteriaEnhanced(); // Re-render to show lock
  },

  toggleLock(critId) {
    const crit = state.criteria.find(c => c.id === critId);
    if (crit) {
      crit.locked = !crit.locked;
      this.renderCriteriaEnhanced();
    }
  },

  collectCriteriaEnhanced() {
    document.querySelectorAll('.crit-weight-input').forEach(input => {
      const critId = input.dataset.critId;
      const crit = state.criteria.find(c => c.id === critId);
      if (crit && crit.isIncluded) {
        crit.weight = parseFloat(input.value) || 0;
      }
    });
  },

  updateWeightSumEnhanced() {
    this.collectCriteriaEnhanced();
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    const sum = activeCriteria.reduce((total, c) => total + c.weight, 0);
    
    const countElement = document.getElementById('crit-count');
    const sumElement = document.getElementById('weight-sum');
    
    countElement.textContent = activeCriteria.length;
    sumElement.innerHTML = `Somma pesi: <span>${sum.toFixed(1)}</span>%`;
    
    if (Math.abs(sum - 100) < 0.5) {
      sumElement.classList.add('valid');
    } else {
      sumElement.classList.remove('valid');
    }
  },

  autoBalanceWeights() {
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    if (activeCriteria.length === 0) return;
    
    // Separate locked and unlocked criteria
    const lockedCriteria = activeCriteria.filter(c => c.locked);
    const unlockedCriteria = activeCriteria.filter(c => !c.locked);
    
    if (unlockedCriteria.length === 0) {
      alert('Tutti i pesi sono bloccati. Sblocca almeno un peso per riequilibrare.');
      return;
    }
    
    // Calculate locked sum
    const lockedSum = lockedCriteria.reduce((sum, c) => sum + c.weight, 0);
    
    if (lockedSum >= 100) {
      alert('I pesi bloccati superano già il 100%. Sblocca alcuni pesi.');
      return;
    }
    
    // Distribute remaining weight among unlocked criteria
    const availableWeight = 100 - lockedSum;
    const equalWeight = availableWeight / unlockedCriteria.length;
    
    unlockedCriteria.forEach(c => {
      c.weight = Math.round(equalWeight * 10) / 10;
    });
    
    // Adjust for rounding errors
    const totalSum = activeCriteria.reduce((s, c) => s + c.weight, 0);
    if (totalSum !== 100 && unlockedCriteria.length > 0) {
      unlockedCriteria[0].weight += (100 - totalSum);
      unlockedCriteria[0].weight = Math.round(unlockedCriteria[0].weight * 10) / 10;
    }
    
    this.renderCriteriaEnhanced();
  },

  resetToDefaults() {
    if (!state.selectedFamily) return;
    
    if (!confirm('Questo ripristinerà i criteri predefiniti e rimuoverà tutti i criteri personalizzati. Continuare?')) {
      return;
    }
    
    // V15+: Reset to original family-specific criteria (NO core criteria)
    const extraCriteria = state.selectedFamily.extraCriteria;
    
    state.criteria = extraCriteria.map(c => ({
      ...c,
      isCore: false,
      isIncluded: true,
      locked: false,
      source: 'extra'
    }));
    
    // Clear custom criteria
    state.customCriteria = [];
    
    this.renderCriteriaEnhanced();
  },

  // Step 3: Criteria (legacy - remove if not needed)
  renderCriteria() {
    const list = document.getElementById('criteria-list');
    list.innerHTML = '';
    
    state.criteria.forEach((crit, index) => {
      const item = document.createElement('div');
      item.className = 'crit-item';
      item.innerHTML = `
        <div class="item-header">
          <span class="item-number">Criterio ${index + 1}</span>
          <button class="btn-remove" onclick="app.removeCriterion(${index})">Rimuovi</button>
        </div>
        <div class="crit-inputs">
          <div class="form-group">
            <input type="text" class="form-control" placeholder="Nome criterio" value="${crit.name}" data-crit-index="${index}" data-field="name">
          </div>
          <div class="form-group">
            <input type="number" class="form-control" placeholder="Peso %" value="${crit.weight}" min="0" max="100" data-crit-index="${index}" data-field="weight" oninput="app.updateWeightSum()">
          </div>
          <div class="form-group">
            <select class="form-control" data-crit-index="${index}" data-field="type">
              <option value="Benefit" ${crit.type === 'Benefit' ? 'selected' : ''}>Beneficio</option>
              <option value="Cost" ${crit.type === 'Cost' ? 'selected' : ''}>Costo</option>
            </select>
          </div>
        </div>
      `;
      list.appendChild(item);
    });

    document.getElementById('crit-count').textContent = state.criteria.length;
    
    const addBtn = document.getElementById('add-crit-btn');
    addBtn.disabled = state.criteria.length >= 10;
    
    this.updateWeightSum();
  },

  addCriterion() {
    if (state.criteria.length >= 10) return;
    
    state.criteria.push({
      id: Date.now(),
      name: '',
      weight: 0,
      type: 'Benefit'
    });
    
    this.renderCriteria();
  },

  removeCriterion(index) {
    state.criteria.splice(index, 1);
    this.renderCriteria();
  },

  collectCriteria() {
    // Legacy - kept for compatibility
  },

  updateWeightSum() {
    // Legacy - use updateWeightSumEnhanced instead
    this.updateWeightSumEnhanced();
  },

  // Convert numeric value to score (0-100)
  convertNumericToScore(value, criterion) {
    if (!criterion.isNumeric) return value;
    
    const { minValue, optimalValue, maxValue, type } = criterion;
    
    // Clamp value within range
    const clampedValue = Math.max(minValue, Math.min(maxValue, value));
    
    let score;
    
    if (type === 'benefit') {
      // Benefit: higher value = higher score
      // Score = (value - min) / (max - min) * 100
      score = ((clampedValue - minValue) / (maxValue - minValue)) * 100;
    } else {
      // Cost: lower value = higher score
      // Score = (max - value) / (max - min) * 100
      score = ((maxValue - clampedValue) / (maxValue - minValue)) * 100;
    }
    
    return Math.max(0, Math.min(100, score));
  },

  // Step 4: Performance Matrix
  renderPerformanceMatrix() {
    this.updateFamilyBadges();
    const container = document.getElementById('performance-matrix');
    
    // Initialize matrix if empty or size changed
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    if (state.performanceMatrix.length !== state.alternatives.length || 
        (state.performanceMatrix[0] && state.performanceMatrix[0].length !== activeCriteria.length)) {
      state.performanceMatrix = state.alternatives.map(() => 
        activeCriteria.map((crit) => crit.isNumeric ? (crit.minValue + crit.maxValue) / 2 : 5)
      );
    }
    
    let html = '<div style="margin-bottom: 16px; padding: 12px; background: var(--color-bg-2); border-radius: var(--radius-base); font-size: 13px;">';
    html += '<strong>💡 Legenda:</strong> ';
    html += '<span class="crit-type-badge benefit" style="margin: 0 8px;">↑ Beneficio</span> = valore alto è migliore | ';
    html += '<span class="crit-type-badge cost" style="margin: 0 8px;">↓ Costo</span> = valore basso è migliore';
    html += '</div>';
    
    html += '<table class="matrix-table"><thead><tr><th></th>';
    
    // Header row with criteria and type indicator
    activeCriteria.forEach(crit => {
      const typeIcon = crit.type === 'benefit' ? '↑' : '↓';
      const typeClass = crit.type === 'benefit' ? 'benefit' : 'cost';
      html += `<th>
        <span class="crit-type-badge ${typeClass}" style="font-size: 10px; padding: 2px 6px;">${typeIcon}</span><br>
        ${crit.name}<br>
        <span class="criterion-weight">${crit.weight.toFixed(1)}% ${crit.unit ? '(' + crit.unit + ')' : ''}</span>
      </th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Data rows
    state.alternatives.forEach((alt, i) => {
      html += `<tr><td class="alt-name">${alt.name}</td>`;
      activeCriteria.forEach((crit, j) => {
        if (crit.isNumeric) {
          // Numeric input
          const formulaText = crit.type === 'cost' 
            ? `Costo: valori bassi = migliori. Formula: (${crit.maxValue}-valore)/(${crit.maxValue}-${crit.minValue})×100`
            : `Beneficio: valori alti = migliori. Formula: (valore-${crit.minValue})/(${crit.maxValue}-${crit.minValue})×100`;
          
          html += `<td title="${formulaText}" style="background: #fff9e6;">
            <input type="number" step="any" value="${state.performanceMatrix[i][j]}" 
              data-row="${i}" data-col="${j}" 
              placeholder="${crit.minValue}-${crit.maxValue}" 
              style="background: #fffbf0;">
            <div style="font-size: 9px; color: #666; margin-top: 2px;">Range: ${crit.minValue}-${crit.maxValue}</div>
          </td>`;
        } else {
          // Score input (1-10)
          const helpText = crit.type === 'cost' ? 'Costo: basso=migliore' : 'Beneficio: alto=migliore';
          html += `<td title="${helpText}"><input type="number" min="1" max="10" step="0.5" value="${state.performanceMatrix[i][j]}" data-row="${i}" data-col="${j}" placeholder="1-10"></td>`;
        }
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    html += '<div style="margin-top: 12px; padding: 10px; background: var(--color-bg-1); border-radius: var(--radius-sm); font-size: 12px; color: var(--color-text-secondary);">';
    html += 'ℹ️ Scala 1-10 dove 1=molto scarso, 5=medio, 10=eccellente. Per i criteri COSTO, il sistema invertià automaticamente la valutazione.';
    html += '</div>';
    
    container.innerHTML = html;
  },

  collectPerformanceMatrix() {
    document.querySelectorAll('.matrix-table input').forEach(input => {
      const row = parseInt(input.dataset.row);
      const col = parseInt(input.dataset.col);
      state.performanceMatrix[row][col] = parseFloat(input.value) || 5;
    });
  },

  // Step 5: Calculate Results - VERSION 8.0 CORRECTED ALGORITHMS
  calculateResults() {
    try {
      console.log("=== V15.1 CALCULATION STARTED (15 Families, Score Bug Fixed, 5 MCDM Methods) ===");
      console.log("Alternatives:", state.alternatives.length);
      console.log("Criteria:", state.criteria.filter(c => c.isIncluded).length);
      
      // Collect preferences
      state.preferences.riskTolerance = parseInt(document.getElementById('risk-tolerance').value);
      state.preferences.confidenceLevel = document.getElementById('confidence-level').value;
      state.preferences.constraints = document.getElementById('constraints').value.trim();
      
      const dataAccuracy = document.getElementById('data-accuracy').checked;
      if (!dataAccuracy) {
        alert('Per favore conferma l\'accuratezza dei dati');
        return;
      }
      
      // VALIDATION
      console.log("Step 1: Validating...");
      
      if (!state.alternatives || state.alternatives.length < 2) {
        alert("❌ Need at least 2 alternatives");
        return;
      }
      
      const enabledCriteria = state.criteria.filter(c => c.isIncluded);
      if (enabledCriteria.length < 1) {
        alert("❌ Need at least 1 criterion");
        return;
      }
      
      const totalWeight = enabledCriteria.reduce((sum, c) => sum + (c.weight || 0), 0);
      if (Math.abs(totalWeight - 100) > 0.5) {
        alert("❌ Weights must sum to 100%. Currently: " + Math.round(totalWeight) + "%");
        return;
      }
      
      // Check matrix complete and validate numeric criteria ranges
      for (let i = 0; i < state.alternatives.length; i++) {
        for (let j = 0; j < enabledCriteria.length; j++) {
          const value = state.performanceMatrix[i] ? state.performanceMatrix[i][j] : null;
          if (value === null || value === undefined || isNaN(parseFloat(value))) {
            alert("❌ Missing value at: " + state.alternatives[i].name + " × " + enabledCriteria[j].name);
            return;
          }
          
          // Validate numeric criteria are within range
          if (enabledCriteria[j].isNumeric) {
            const numValue = parseFloat(value);
            const min = enabledCriteria[j].minValue;
            const max = enabledCriteria[j].maxValue;
            if (numValue < min || numValue > max) {
              alert(`❌ Valore fuori range per ${enabledCriteria[j].name}: ${numValue}. Range consentito: ${min}-${max}`);
              return;
            }
          }
        }
      }
      
      console.log("✓ Validation passed");
      
      // STEP 0: Convert numeric criteria to scores
      console.log("Step 1.5: Converting numeric criteria to scores...");
      const convertedMatrix = [];
      for (let i = 0; i < state.performanceMatrix.length; i++) {
        convertedMatrix[i] = [];
        for (let j = 0; j < enabledCriteria.length; j++) {
          const value = state.performanceMatrix[i][j];
          if (enabledCriteria[j].isNumeric) {
            // Convert numeric to score (0-100)
            const score = this.convertNumericToScore(value, enabledCriteria[j]);
            // Scale to 1-10 for normalization consistency
            convertedMatrix[i][j] = (score / 10);
            console.log(`  Converted ${enabledCriteria[j].name}: ${value} → ${score.toFixed(1)}/100 → ${convertedMatrix[i][j].toFixed(2)}/10`);
          } else {
            convertedMatrix[i][j] = value;
          }
        }
      }
      console.log("✓ Numeric criteria converted");
      
      // STEP 1: NORMALIZE WITH COST INVERSION (V8.4 FIX)
      console.log("Step 2: Normalizing matrix with cost inversion...");
      
      const normalized = this.normalizeMatrix(convertedMatrix, enabledCriteria);
      
      console.log("✓ Matrix normalized (cost criteria inverted correctly)");
      
      // CALCULATE 5 DIFFERENT METHODS (V8.4)
      console.log("Step 3: Calculating 5 MCDM methods (WSM, TOPSIS, VIKOR, AHP, BDT)...");
      
      // === WSM (Weighted Sum Method) ===
      const wsmScores = [];
      for (let i = 0; i < state.alternatives.length; i++) {
        let score = 0;
        for (let j = 0; j < enabledCriteria.length; j++) {
          score += (enabledCriteria[j].weight / 100 || 0) * normalized[i][j];
        }
        wsmScores.push(score);
      }
      console.log("✓ WSM calculated");
      
      // === TOPSIS (Ideal Distance Method) ===
      const topsisScores = [];
      const idealPos = [];
      const idealNeg = [];
      
      // Find ideal positive (max) and negative (min) for each criterion
      for (let j = 0; j < enabledCriteria.length; j++) {
        let maxVal = -Infinity, minVal = Infinity;
        for (let i = 0; i < state.alternatives.length; i++) {
          maxVal = Math.max(maxVal, normalized[i][j]);
          minVal = Math.min(minVal, normalized[i][j]);
        }
        idealPos.push(maxVal); // Best = max (all are benefits now)
        idealNeg.push(minVal); // Worst = min
      }
      
      for (let i = 0; i < state.alternatives.length; i++) {
        let distPos = 0, distNeg = 0;
        for (let j = 0; j < enabledCriteria.length; j++) {
          const w = (enabledCriteria[j].weight / 100 || 0);
          const val = normalized[i][j];
          distPos += w * Math.pow(val - idealPos[j], 2);
          distNeg += w * Math.pow(val - idealNeg[j], 2);
        }
        distPos = Math.sqrt(distPos);
        distNeg = Math.sqrt(distNeg);
        
        const topsisScore = (distPos + distNeg) === 0 ? 0.5 : distNeg / (distPos + distNeg);
        topsisScores.push(topsisScore);
      }
      console.log("✓ TOPSIS calculated");
      
      // === VIKOR (Compromise Solution) ===
      const vikorScores = [];
      
      // Find best and worst for each criterion
      const best = [], worst = [];
      for (let j = 0; j < enabledCriteria.length; j++) {
        let maxVal = -Infinity, minVal = Infinity;
        for (let i = 0; i < state.alternatives.length; i++) {
          maxVal = Math.max(maxVal, normalized[i][j]);
          minVal = Math.min(minVal, normalized[i][j]);
        }
        best.push(maxVal);
        worst.push(minVal);
      }
      
      // Calculate S and R for each alternative
      const S_scores = [], R_scores = [];
      for (let i = 0; i < state.alternatives.length; i++) {
        let S = 0, R = 0;
        for (let j = 0; j < enabledCriteria.length; j++) {
          const w = (enabledCriteria[j].weight / 100 || 0);
          const range = best[j] - worst[j];
          const norm = range === 0 ? 0 : (best[j] - normalized[i][j]) / range;
          S += w * norm;
          R = Math.max(R, w * norm);
        }
        S_scores.push(S);
        R_scores.push(R);
      }
      
      // Combine S and R into Q scores
      const S_min = Math.min(...S_scores);
      const S_max = Math.max(...S_scores);
      const R_min = Math.min(...R_scores);
      const R_max = Math.max(...R_scores);
      const v = 0.5; // Compromise parameter
      
      for (let i = 0; i < state.alternatives.length; i++) {
        const S_range = S_max - S_min;
        const R_range = R_max - R_min;
        const S_norm = S_range === 0 ? 0 : (S_scores[i] - S_min) / S_range;
        const R_norm = R_range === 0 ? 0 : (R_scores[i] - R_min) / R_range;
        const Q = v * S_norm + (1 - v) * R_norm;
        vikorScores.push(1 - Q); // Invert so higher = better
      }
      console.log("✓ VIKOR calculated");
      
      // === AHP (Analytic Hierarchy Process) - V8.4 ===
      const ahpScores = [];
      for (let i = 0; i < normalized.length; i++) {
        let product = 1;
        for (let j = 0; j < normalized[i].length; j++) {
          const w = (enabledCriteria[j].weight / 100 || 0);
          // ✅ Uses normalized (cost already inverted)
          product *= Math.pow(Math.max(normalized[i][j], 0.001), w);
        }
        ahpScores.push(product);
      }
      
      // Normalize AHP scores to 0-1
      const maxAHP = Math.max(...ahpScores);
      const normalizedAHP = ahpScores.map(s => (s / maxAHP));
      console.log("✓ AHP calculated");
      
      // === BDT (Benefit-Cost Decision Tree) - V8.4 ===
      // ✅ After cost inversion, all values are "benefit" oriented
      // BDT uses weighted average like WSM (cannot do true B/C ratio)
      const bdtScores = [];
      
      for (let i = 0; i < normalized.length; i++) {
        let score = 0;
        for (let j = 0; j < normalized[i].length; j++) {
          // ✅ All criteria treated as benefit (cost already inverted)
          score += (enabledCriteria[j].weight / 100) * normalized[i][j];
        }
        bdtScores.push(score);
      }
      
      // Normalize BDT scores to 0-1
      const maxBDT = Math.max(...bdtScores);
      const normalizedBDT = bdtScores.map(s => (s / maxBDT));
      console.log("✓ BDT calculated");
      
      // ENSEMBLE AGGREGATION (5 methods: 20% each)
      console.log("Step 4: Aggregating results (ensemble - 5 methods)...");
      
      const ensembleScores = [];
      for (let i = 0; i < state.alternatives.length; i++) {
        const score = 
          0.20 * (wsmScores[i] || 0) +
          0.20 * (topsisScores[i] || 0) +
          0.20 * (vikorScores[i] || 0) +
          0.20 * (normalizedAHP[i] || 0) +
          0.20 * (normalizedBDT[i] || 0);
        ensembleScores.push(score);
      }
      
      // V15+ FIX: Direct scaling to 0-100 without re-normalization
      // This preserves the TRUE ensemble value (mean of 5 algorithms)
      // NO re-scaling to force top score to 100%
      const finalScores = ensembleScores.map(s => s * 100);
      
      // CONSERVATIVE PROBABILITIES (direct normalization, not softmax)
      const sumScores = finalScores.reduce((a, b) => a + b, 0);
      const probabilities = finalScores.map(s => sumScores === 0 ? 0 : (s / sumScores) * 100);
      
      console.log("✓ Ensemble aggregated");
      
      // CREATE RESULTS
      console.log("Step 5: Creating results...");
      
      const results = {
        alternatives: state.alternatives.map((alt, i) => ({
          name: alt.name,
          description: alt.description,
          score: Math.round(finalScores[i] * 100) / 100,
          probability: Math.round(probabilities[i] * 100) / 100,
          rank: 0
        })),
        methodScores: {
          wsm: wsmScores,
          topsis: topsisScores,
          vikor: vikorScores,
          ahp: normalizedAHP,
          bdt: normalizedBDT
        },
        criteria: enabledCriteria,
        timestamp: new Date().toISOString()
      };
      
      // Create rankings for display
      const rankings = state.alternatives.map((alt, i) => ({
        alternative: alt.name,
        score: finalScores[i],
        confidence: probabilities[i],
        wsm: wsmScores[i] * 100,
        topsis: topsisScores[i] * 100,
        vikor: vikorScores[i] * 100,
        ahp: normalizedAHP[i] * 100,
        bdt: normalizedBDT[i] * 100,
        index: i
      }));
      
      // SORT AND RANK
      rankings.sort((a, b) => b.score - a.score);
      rankings.forEach((alt, idx) => {
        alt.rank = idx + 1;
      });
      
      console.log("✓ Results created");
      
      // Sensitivity analysis
      const sensitivityAnalysis = this.performSensitivityAnalysis(normalized, enabledCriteria);
      
      // Calculate score variance for confidence assessment
      const scoreVariance = this.calculateScoreVariance(finalScores);
      const avgScore = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
      const scoreDiff = Math.max(...finalScores) - Math.min(...finalScores);
      
      // UPDATE STATE
      console.log("Step 6: Updating state...");
      
      state.results = {
        rankings,
        sensitivityAnalysis,
        methodScores: { wsmScores, topsisScores, vikorScores, ahpScores: normalizedAHP, bdtScores: normalizedBDT },
        normalized,
        scoreVariance,
        avgScore,
        scoreDiff
      };
      state.step = 7;
      
      console.log("✓ State.step set to:", state.step);
      console.log("=== V15.1 CALCULATION COMPLETE - Score Finale Bug Fixed ===");
      console.log("Top alternative:", rankings[0].alternative, "Score:", rankings[0].score);
      console.log("Score difference (1st - 2nd):", rankings.length > 1 ? (rankings[0].score - rankings[1].score).toFixed(2) : 'N/A');
      console.log("Variance:", scoreVariance.toFixed(4));
      console.log("Family:", state.selectedFamily ? state.selectedFamily.nome : 'N/A');
      console.log("Criteria count:", enabledCriteria.length, "(all family-specific)");
      console.log("V15.1 FIX: Score Finale shows REAL ensemble value (not normalized to 100%)");
      
      // DISPLAY RESULTS
      console.log("Displaying results...");
      this.displayResults();
      console.log("Results displayed");
      
      // NAVIGATE TO RESULTS SCREEN
      console.log("Navigating to results screen...");
      this.showScreen('results-screen');
      console.log("Navigation complete");
      
    } catch (error) {
      console.error("❌ CALCULATION ERROR:", error);
      console.error("Stack:", error.stack);
      alert("❌ Errore nel calcolo: " + error.message + "\n\nVedi console per dettagli.");
      this.showScreen('step5-screen');
    }
  },

  validateCalculationInputs() {
    // Check alternatives
    if (state.alternatives.length < 2) {
      return 'Errore: Devi avere almeno 2 alternative';
    }
    
    // Check criteria
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    if (activeCriteria.length < 1) {
      return 'Errore: Devi avere almeno 1 criterio attivo';
    }
    
    // Check weights sum to 100%
    const totalWeight = activeCriteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.5) {
      return `Errore: I pesi devono sommare a 100%. Attualmente: ${totalWeight.toFixed(1)}%`;
    }
    
    // Check performance matrix
    if (!state.performanceMatrix || state.performanceMatrix.length === 0) {
      return 'Errore: Matrice delle performance non inizializzata';
    }
    
    // Check all cells filled
    for (let i = 0; i < state.performanceMatrix.length; i++) {
      for (let j = 0; j < state.performanceMatrix[i].length; j++) {
        const value = state.performanceMatrix[i][j];
        if (value === null || value === undefined || isNaN(value)) {
          const altName = state.alternatives[i]?.name || `Alternativa ${i+1}`;
          const critName = activeCriteria[j]?.name || `Criterio ${j+1}`;
          return `Errore: Valore mancante per "${altName}" × "${critName}"`;
        }
        if (value < 1 || value > 10) {
          return `Errore: Tutti i valori devono essere tra 1 e 10`;
        }
      }
    }
    
    // Check at least one alternative has different values
    const firstRow = state.performanceMatrix[0];
    const allSame = state.performanceMatrix.every(row => 
      row.every((val, idx) => val === firstRow[idx])
    );
    if (allSame) {
      return 'Errore: Tutte le alternative hanno gli stessi valori. Non c\'è differenza da valutare.';
    }
    
    return null; // No errors
  },



  // MCDM Calculations - VERSION 8.4 CORRECTED
  performMCDMAnalysis() {
    const matrix = state.performanceMatrix;
    const criteria = state.criteria.filter(c => c.isIncluded);
    const alternatives = state.alternatives;
    
    // Normalize matrix with cost inversion
    const normalized = this.normalizeMatrix(matrix, criteria);
    
    // Calculate scores using different methods
    const topsisScores = this.calculateTOPSIS(normalized, criteria);
    const ahpScores = this.calculateAHP(normalized, criteria);
    const bayesianScores = this.calculateBayesian(matrix);
    const wsmScores = this.calculateWSM(normalized, criteria);
    
    // Ensemble aggregation
    const ensembleScores = alternatives.map((alt, i) => {
      return 0.40 * topsisScores[i] + 
             0.30 * ahpScores[i] + 
             0.20 * bayesianScores[i] + 
             0.10 * wsmScores[i];
    });
    
    // Scale to 0-100
    const finalScores = ensembleScores.map(s => s * 100);
    
    // Calculate probabilities using softmax
    const probabilities = this.softmax(ensembleScores.map(s => s * 5));
    
    // Sensitivity analysis
    const sensitivityAnalysis = this.performSensitivityAnalysis(normalized, criteria);
    
    // Create rankings
    const rankings = alternatives.map((alt, i) => ({
      alternative: alt.name,
      score: finalScores[i],
      confidence: probabilities[i] * 100,
      topsis: topsisScores[i] * 100,
      ahp: ahpScores[i] * 100,
      bayesian: bayesianScores[i] * 100,
      wsm: wsmScores[i] * 100,
      index: i
    }));
    
    rankings.sort((a, b) => b.score - a.score);
    
    return {
      rankings,
      sensitivityAnalysis,
      methodScores: { topsisScores, ahpScores, bayesianScores, wsmScores },
      normalized
    };
  },

  // VERSION 8.4: CORRECTED NORMALIZATION WITH COST INVERSION
  normalizeMatrix(matrix, criteria) {
    const normalized = [];
    
    for (let i = 0; i < matrix.length; i++) {
      normalized[i] = [];
      
      for (let j = 0; j < criteria.length; j++) {
        // STEP 1: Collect column values WITH COST INVERSION
        let colValues = [];
        for (let k = 0; k < matrix.length; k++) {
          let val = parseFloat(matrix[k][j]);
          
          // ✅ CRITICAL: INVERT COST CRITERIA (10 - value)
          if (criteria[j].type === 'cost' || criteria[j].type === 'Cost') {
            val = 10 - val;  // High cost becomes low score, low cost becomes high score
          }
          
          colValues.push(val);
        }
        
        // STEP 2: Calculate min and max from INVERTED values
        const min = Math.min(...colValues);
        const max = Math.max(...colValues);
        
        // STEP 3: Normalize to 0-1 using benefit formula
        let normalized_val;
        if (max === min) {
          normalized_val = 0.5;  // Edge case: all values same
        } else {
          // Now ALL criteria follow benefit logic: (value - min) / (max - min)
          // High inverted value (low cost) → high normalized value
          // Low inverted value (high cost) → low normalized value
          normalized_val = (colValues[i] - min) / (max - min);
        }
        
        normalized[i][j] = normalized_val;
      }
    }
    
    return normalized;
  },

  // VERSION 8.4: TOPSIS with cost already inverted in normalized matrix
  calculateTOPSIS(normalized, criteria) {
    const m = normalized.length;
    const n = criteria.length;
    
    // Weighted normalized matrix
    const weighted = normalized.map(row => 
      row.map((val, j) => val * (criteria[j].weight / 100))
    );
    
    // ✅ Ideal positive = MAX (cost already inverted, so all are "benefit")
    // ✅ Ideal negative = MIN (cost already inverted)
    const idealPositive = [];
    const idealNegative = [];
    
    for (let j = 0; j < n; j++) {
      const column = weighted.map(row => row[j]);
      idealPositive[j] = Math.max(...column);
      idealNegative[j] = Math.min(...column);
    }
    
    // Calculate distances
    const scores = [];
    for (let i = 0; i < m; i++) {
      let distPositive = 0;
      let distNegative = 0;
      
      for (let j = 0; j < n; j++) {
        distPositive += Math.pow(weighted[i][j] - idealPositive[j], 2);
        distNegative += Math.pow(weighted[i][j] - idealNegative[j], 2);
      }
      
      distPositive = Math.sqrt(distPositive);
      distNegative = Math.sqrt(distNegative);
      
      scores[i] = distNegative / (distPositive + distNegative) || 0;
    }
    
    return scores;
  },

  // VERSION 8.4: AHP with cost already inverted
  calculateAHP(normalized, criteria) {
    // ✅ Uses normalized matrix (cost already inverted)
    // Geometric mean for more conservative aggregation
    const scores = [];
    
    for (let i = 0; i < normalized.length; i++) {
      let product = 1;
      for (let j = 0; j < normalized[i].length; j++) {
        const w = criteria[j].weight / 100;
        // Geometric mean: product of (value^weight)
        product *= Math.pow(Math.max(normalized[i][j], 0.001), w);
      }
      scores.push(product);
    }
    
    // Normalize to 0-1
    const max = Math.max(...scores);
    return scores.map(s => (s / max));
  },

  calculateBayesian(matrix) {
    const means = matrix.map(row => {
      const sum = row.reduce((a, b) => a + b, 0);
      return sum / row.length;
    });
    
    // Normalize means to 0-1
    const min = Math.min(...means);
    const max = Math.max(...means);
    const range = max - min || 1;
    
    return means.map(m => (m - min) / range);
  },

  // VERSION 8.4: WSM with cost already inverted
  calculateWSM(normalized, criteria) {
    // ✅ Uses normalized matrix (cost already inverted)
    return normalized.map(row => {
      let sum = 0;
      row.forEach((val, j) => {
        sum += val * (criteria[j].weight / 100);
      });
      return sum;
    });
  },

  softmax(scores) {
    const expScores = scores.map(s => Math.exp(s));
    const sum = expScores.reduce((a, b) => a + b, 0);
    return expScores.map(e => e / sum);
  },

  performSensitivityAnalysis(normalized, criteria) {
    const results = [];
    const alternatives = state.alternatives;
    
    criteria.forEach((crit, critIndex) => {
      const weightVariations = [];
      let changeDetected = false;
      
      // Test weight from current-10% to current+30% in steps of 5%
      const baseWeight = crit.weight;
      for (let delta = -10; delta <= 30; delta += 10) {
        const testCriteria = JSON.parse(JSON.stringify(criteria));
        testCriteria[critIndex].weight = Math.max(1, baseWeight + delta);
        
        // Renormalize other weights proportionally
        const otherWeightSum = testCriteria.reduce((sum, c, i) => i === critIndex ? sum : sum + c.weight, 0);
        const targetOtherSum = 100 - testCriteria[critIndex].weight;
        testCriteria.forEach((c, i) => {
          if (i !== critIndex && otherWeightSum > 0) {
            c.weight = (c.weight / otherWeightSum) * targetOtherSum;
          }
        });
        
        const testScores = this.calculateWSM(normalized, testCriteria);
        const winner = alternatives[testScores.indexOf(Math.max(...testScores))].name;
        
        weightVariations.push({
          weight: testCriteria[critIndex].weight.toFixed(0),
          winner: winner
        });
        
        if (delta > 0 && weightVariations[0].winner !== winner) {
          changeDetected = true;
        }
      }
      
      results.push({
        criterion: crit.name,
        stable: !changeDetected,
        sensitivity: changeDetected ? 'Alta' : 'Bassa',
        variations: weightVariations
      });
    });
    
    return results;
  },

  // Display Results
  displayResults() {
    console.log("displayResults() called");
    
    if (!state.results || !state.results.rankings || state.results.rankings.length === 0) {
      console.error("No results to display!");
      alert("Errore: Nessun risultato da visualizzare");
      return;
    }
    
    const results = state.results;
    const top = results.rankings[0];
    console.log("Top recommendation:", top.alternative);
    
    // Problem title
    document.getElementById('problem-title-results').textContent = state.problem.title;
    
    // Summary card
    document.getElementById('top-recommendation').textContent = top.alternative;
    document.getElementById('top-score').textContent = top.score.toFixed(2);
    
    const scoreDiff = results.scoreDiff || 0;
    const confidenceText = scoreDiff < 5 ? 'Bassa (⚠️ simile ad altre)' : 
                           scoreDiff < 15 ? 'Media (≈ preferenza moderata)' : 
                           'Alta (✓✓ chiara preferenza)';
    document.getElementById('top-confidence').textContent = confidenceText;
    
    let explanation = '';
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    
    if (scoreDiff < 5) {
      explanation = `⚠️ "${top.alternative}" emerge come una delle opzioni migliori, ma è <strong>molto simile</strong> ad altre alternative (differenza: ${scoreDiff.toFixed(1)} punti). `;
      explanation += `L'analisi di ${activeCriteria.length} criteri su ${state.alternatives.length} alternative mostra che più opzioni sono valide. `;
      explanation += `Considera fattori aggiuntivi non quantificati per la decisione finale.`;
    } else if (scoreDiff < 15) {
      explanation = `"${top.alternative}" emerge come scelta preferita con una differenza moderata di ${scoreDiff.toFixed(1)} punti rispetto alle alternative. `;
      explanation += `Basato su ${activeCriteria.length} criteri e ${state.alternatives.length} alternative, questa è una buona scelta ma non assoluta. `;
      explanation += `Verifica i criteri più importanti per la tua situazione.`;
    } else {
      explanation = `✓✓ "${top.alternative}" emerge chiaramente come la migliore opzione con un vantaggio significativo di ${scoreDiff.toFixed(1)} punti. `;
      explanation += `L'analisi di ${activeCriteria.length} criteri su ${state.alternatives.length} alternative mostra una preferenza forte e robusta. `;
      explanation += `Questa raccomandazione rappresenta un equilibrio ottimale tra tutti i fattori considerati.`;
    }
    
    document.getElementById('recommendation-explanation').innerHTML = explanation;
    
    // Rankings table
    this.displayRankingsTable();
    
    // Graphic Method Rankings
    try {
      console.log("Rendering method rankings...");
      this.populateMethodRankings();
      console.log("Method rankings rendered");
    } catch (e) {
      console.error("Error rendering method rankings:", e);
    }
    
    // Performance Profile
    try {
      console.log("Rendering performance profile...");
      this.populatePerformanceProfile();
      console.log("Performance profile rendered");
    } catch (e) {
      console.error("Error rendering performance profile:", e);
    }
    
    // Pareto Frontier
    try {
      console.log("Rendering Pareto frontier...");
      this.populateParetoFrontier();
      console.log("Pareto frontier rendered");
    } catch (e) {
      console.error("Error rendering Pareto:", e);
    }
    
    // Family-specific insights
    try {
      console.log("Displaying family metrics...");
      this.displayFamilyMetrics();
      console.log("Family metrics displayed");
    } catch (e) {
      console.error("Error displaying family metrics:", e);
    }
    
    // Method agreement
    try {
      console.log("Displaying method agreement...");
      this.displayMethodAgreement();
      console.log("Method agreement displayed");
    } catch (e) {
      console.error("Error displaying method agreement:", e);
    }
    
    // Sensitivity analysis
    try {
      console.log("Displaying sensitivity analysis...");
      this.displaySensitivityAnalysis();
      console.log("Sensitivity analysis displayed");
    } catch (e) {
      console.error("Error displaying sensitivity:", e);
    }
    
    // Detailed explanation
    try {
      console.log("Displaying detailed explanation...");
      this.displayDetailedExplanation();
      console.log("Detailed explanation displayed");
    } catch (e) {
      console.error("Error displaying explanation:", e);
    }
    
    // Scenario analysis
    try {
      console.log("Displaying scenarios...");
      this.populateScenarios();
      console.log("Scenarios displayed");
    } catch (e) {
      console.error("Error displaying scenarios:", e);
    }
    
    console.log("displayResults() complete");
  },

  displayRankingsTable() {
    const tbody = document.getElementById('resultsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    state.results.rankings.forEach((rank, index) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid #ddd';
      
      const confidencePct = Math.min(100, Math.max(0, rank.confidence)).toFixed(0);
      
      row.innerHTML = `
        <td style="padding: 10px; text-align: left;"><strong>${index + 1}</strong></td>
        <td style="padding: 10px; text-align: left;"><strong>${rank.alternative}</strong></td>
        <td style="padding: 10px; text-align: center;">${rank.wsm.toFixed(1)}</td>
        <td style="padding: 10px; text-align: center;">${rank.topsis.toFixed(1)}</td>
        <td style="padding: 10px; text-align: center;">${rank.vikor.toFixed(1)}</td>
        <td style="padding: 10px; text-align: center;">${rank.ahp.toFixed(1)}</td>
        <td style="padding: 10px; text-align: center;">${rank.bdt.toFixed(1)}</td>
        <td style="padding: 10px; text-align: center;"><strong style="font-size: 16px; color: var(--color-primary);">${rank.score.toFixed(1)}</strong></td>
        <td style="padding: 10px; text-align: center;"><span style="background: var(--color-secondary); padding: 4px 8px; border-radius: 4px;">${confidencePct}%</span></td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Now populate graphic method rankings
    this.populateMethodRankings();
  },
  
  populateMethodRankings() {
    const rankings = state.results.rankings;
    const tbody = document.getElementById('methodRankingTableBody');
    
    if (!tbody) {
      console.error('Method ranking table body not found');
      return;
    }
    
    tbody.innerHTML = '';
    
    const methods = ['wsm', 'topsis', 'vikor', 'ahp', 'bdt'];
    
    // For each rank position (1, 2, 3, ...)
    for (let rankPos = 1; rankPos <= rankings.length; rankPos++) {
      
      // Create row
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid #e0e0e0';
      
      // Alternate row colors
      if (rankPos % 2 === 0) {
        row.style.background = '#fafafa';
      }
      
      // POSITION CELL
      const rankEmoji = rankPos === 1 ? '🥇' : rankPos === 2 ? '🥈' : rankPos === 3 ? '🥉' : '🏅';
      let positionCell = `
        <td style="padding: 12px; vertical-align: middle; font-weight: 600; text-align: left; color: #333;">
          ${rankPos}° <span style="font-size: 18px;">${rankEmoji}</span>
        </td>
      `;
      
      // Find alternatives at this rank for each method
      let consensusCount = 0;
      let methodCells = '';
      
      // Sort rankings by ensemble (final score) to get consensus positions
      const ensembleRanked = [...rankings].sort((a, b) => b.score - a.score);
      
      methods.forEach((method, idx) => {
        // Sort by this method
        const sortedByMethod = [...rankings].sort((a, b) => b[method] - a[method]);
        const altAtThisRank = sortedByMethod[rankPos - 1];
        
        const score = altAtThisRank[method];
        const barWidth = Math.min(100, Math.max(0, score));
        
        // Check if this alternative is also at this rank in ensemble (consensus)
        const ensemblePos = ensembleRanked.findIndex(r => r.alternative === altAtThisRank.alternative) + 1;
        const isConsensus = ensemblePos === rankPos;
        if (isConsensus) consensusCount++;
        
        // Color the cell if it's in consensus
        const cellBg = isConsensus ? 'background: #e8f5e9;' : '';
        
        methodCells += `
          <td style="padding: 12px; text-align: center; vertical-align: middle; ${cellBg} border: 1px solid #f0f0f0;">
            <!-- Alternative name and score -->
            <div style="font-weight: 600; color: #333; margin-bottom: 6px; font-size: 13px;">
              ${altAtThisRank.alternative}
            </div>
            
            <!-- Score number -->
            <div style="color: #667eea; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
              ${score.toFixed(0)}
            </div>
            
            <!-- Bar chart -->
            <div style="background: #e8e8e8; border-radius: 3px; height: 18px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
              <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); 
                          height: 100%; 
                          width: ${barWidth}%; 
                          transition: width 0.3s ease;
                          box-shadow: 0 1px 3px rgba(102, 126, 234, 0.3);"></div>
            </div>
          </td>
        `;
      });
      
      // CONSENSUS CELL
      let consensusIcon = '❌ 0/5';
      let consensusColor = '#e74c3c';
      
      if (consensusCount === 5) {
        consensusIcon = '✅ 5/5';
        consensusColor = '#27ae60';
      } else if (consensusCount === 4) {
        consensusIcon = '⚠️ 4/5';
        consensusColor = '#f39c12';
      } else if (consensusCount >= 3) {
        consensusIcon = '⚠️ ' + consensusCount + '/5';
        consensusColor = '#f39c12';
      } else if (consensusCount >= 1) {
        consensusIcon = '⚠️ ' + consensusCount + '/5';
        consensusColor = '#ff9800';
      }
      
      let consensusCell = `
        <td style="padding: 12px; text-align: center; vertical-align: middle; font-weight: 600; color: ${consensusColor}; border: 1px solid #f0f0f0;">
          ${consensusIcon}
        </td>
      `;
      
      row.innerHTML = positionCell + methodCells + consensusCell;
      tbody.appendChild(row);
    }
  },

  calculateMethodAgreement(rank) {
    const scores = [rank.wsm, rank.topsis, rank.vikor];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 5) return '✓ Alto';
    if (stdDev < 10) return '≈ Medio';
    return '✗ Basso';
  },

  calculateSpearmanCorrelation(ranking1, ranking2, ranking3) {
    // Calculate average rank position for each alternative
    const altNames = ranking1.map(r => r.alternative);
    const avgRanks = altNames.map(name => {
      const rank1 = ranking1.findIndex(r => r.alternative === name) + 1;
      const rank2 = ranking2.findIndex(r => r.alternative === name) + 1;
      const rank3 = ranking3.findIndex(r => r.alternative === name) + 1;
      return (rank1 + rank2 + rank3) / 3;
    });
    
    // Calculate correlation between each method and average
    let totalCorr = 0;
    let count = 0;
    
    [ranking1, ranking2, ranking3].forEach(ranking => {
      const ranks = altNames.map(name => ranking.findIndex(r => r.alternative === name) + 1);
      const correlation = this.pearsonCorrelation(ranks, avgRanks);
      if (!isNaN(correlation)) {
        totalCorr += correlation;
        count++;
      }
    });
    
    return count > 0 ? totalCorr / count : 0.5;
  },

  pearsonCorrelation(x, y) {
    const n = x.length;
    const sum_x = x.reduce((a, b) => a + b, 0);
    const sum_y = y.reduce((a, b) => a + b, 0);
    const sum_xy = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sum_x2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sum_y2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sum_xy - sum_x * sum_y;
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));
    
    return denominator === 0 ? 0 : numerator / denominator;
  },

  calculateScoreVariance(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    return variance;
  },

  displayCharts() {
    // Bar chart
    const scoresCtx = document.getElementById('scores-chart').getContext('2d');
    new Chart(scoresCtx, {
      type: 'bar',
      data: {
        labels: state.results.rankings.map(r => r.alternative),
        datasets: [{
          label: 'Score Finale',
          data: state.results.rankings.map(r => r.score),
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
    
    // Radar chart for ALL alternatives (top emphasized)
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    const enabledIndices = state.criteria.map((c, i) => c.isIncluded ? i : -1).filter(i => i >= 0);
    
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F', '#DB4545'];
    const datasets = state.results.rankings.slice(0, 5).map((ranking, idx) => {
      const altData = enabledIndices.map(i => state.performanceMatrix[ranking.index][i]);
      const isTop = idx === 0;
      return {
        label: `${idx + 1}. ${ranking.alternative}`,
        data: altData,
        backgroundColor: isTop ? 'rgba(31, 184, 205, 0.3)' : `rgba(${colors[idx].match(/\w\w/g).map(x => parseInt(x, 16)).join(',')}, 0.1)`,
        borderColor: colors[idx],
        pointBackgroundColor: colors[idx],
        borderWidth: isTop ? 3 : 1.5,
        pointRadius: isTop ? 5 : 3
      };
    });
    
    const radarCtx = document.getElementById('radar-chart').getContext('2d');
    new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: activeCriteria.map(c => c.name),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 10
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 11
              },
              padding: 10
            }
          },
          title: {
            display: true,
            text: 'Confronto Performance (Top 5 Alternative)',
            font: {
              size: 13
            }
          }
        }
      }
    });

    // Pareto Frontier Chart
    this.displayParetoChart();
  },

  displayParetoChart() {
    const container = document.getElementById('pareto-chart').parentElement;
    
    // Get enabled criteria only
    const enabledCriteria = state.criteria.filter(c => c.isIncluded);
    if (enabledCriteria.length < 2) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--color-text-secondary);">⚠️ Necessari almeno 2 criteri per l\'analisi Pareto</p>';
      return;
    }
    
    // Calculate Pareto frontier for all criterion pairs
    const paretoResults = this.calculateParetoFrontier(enabledCriteria);
    
    let html = '<div style="max-height: 300px; overflow-y: auto;">';
    html += '<div style="margin-bottom: 12px; padding: 10px; background: var(--color-bg-1); border-radius: var(--radius-sm); font-size: 12px;">';
    html += '<strong>📊 Frontiera di Pareto:</strong> Alternative non dominate per ogni coppia di criteri';
    html += '</div>';
    
    paretoResults.forEach((pair, idx) => {
      html += `<div style="padding: 12px; margin-bottom: 8px; background: var(--color-bg-${(idx % 4) + 1}); border-radius: var(--radius-sm); border-left: 3px solid var(--color-primary);">`;
      html += `<strong style="font-size: 13px;">${pair.crit1} vs ${pair.crit2}</strong><br>`;
      html += `<span style="font-size: 12px; color: var(--color-text-secondary);">Frontiera: `;
      
      if (pair.frontier.length === state.alternatives.length) {
        html += `<em>Tutte le alternative sono sulla frontiera (non c'è dominanza)</em>`;
      } else if (pair.frontier.length === 1) {
        html += `<strong style="color: var(--color-primary);">${pair.frontier[0]}</strong> (unica non dominata)`;
      } else {
        html += pair.frontier.map(alt => `<strong style="color: var(--color-primary);">${alt}</strong>`).join(', ');
      }
      
      html += '</span></div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
  },

  calculateParetoFrontier(enabledCriteria) {
    const results = [];
    const alternatives = state.alternatives;
    
    // Get performance data for enabled criteria only
    const enabledIndices = [];
    state.criteria.forEach((c, i) => {
      if (c.isIncluded) {
        enabledIndices.push(i);
      }
    });
    
    // For each pair of criteria
    for (let i = 0; i < enabledCriteria.length; i++) {
      for (let j = i + 1; j < enabledCriteria.length; j++) {
        const crit1 = enabledCriteria[i];
        const crit2 = enabledCriteria[j];
        
        // Get scores for these two criteria (transformed for cost criteria)
        const scores1 = alternatives.map((alt, altIdx) => {
          const value = state.performanceMatrix[altIdx][enabledIndices[i]];
          return crit1.type === 'cost' ? 10 - value : value;
        });
        
        const scores2 = alternatives.map((alt, altIdx) => {
          const value = state.performanceMatrix[altIdx][enabledIndices[j]];
          return crit2.type === 'cost' ? 10 - value : value;
        });
        
        // Find non-dominated alternatives
        const frontier = [];
        for (let altIdx = 0; altIdx < alternatives.length; altIdx++) {
          let isDominated = false;
          
          for (let otherIdx = 0; otherIdx < alternatives.length; otherIdx++) {
            if (altIdx === otherIdx) continue;
            
            // Check if other dominates current
            const betterOn1 = scores1[otherIdx] >= scores1[altIdx];
            const betterOn2 = scores2[otherIdx] >= scores2[altIdx];
            const strictlyBetter1 = scores1[otherIdx] > scores1[altIdx];
            const strictlyBetter2 = scores2[otherIdx] > scores2[altIdx];
            
            if ((betterOn1 && betterOn2) && (strictlyBetter1 || strictlyBetter2)) {
              isDominated = true;
              break;
            }
          }
          
          if (!isDominated) {
            frontier.push(alternatives[altIdx].name);
          }
        }
        
        results.push({
          crit1: crit1.name,
          crit2: crit2.name,
          frontier: frontier
        });
      }
    }
    
    return results;
  },

  populatePerformanceProfile() {
    const container = document.getElementById('performanceProfile');
    if (!container) return;
    
    const profileDiv = container.querySelector('div');
    if (!profileDiv) return;
    
    const results = state.results.rankings;
    let html = '';
    
    results.forEach((r, i) => {
      const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
      const barWidth = Math.min(100, Math.max(0, r.score));
      
      html += `
        <div style="padding: 15px; background: white; border-left: 4px solid #667eea; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>${emoji} ${r.alternative}</strong></span>
            <span style="font-weight: 600; color: #667eea;">${r.score.toFixed(1)}/100</span>
          </div>
          <div style="background: #e0e0e0; border-radius: 4px; height: 24px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); 
                        height: 100%; width: ${barWidth}%; transition: width 0.3s;"></div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #999; margin-top: 4px;">
            ${barWidth.toFixed(0)}%
          </div>
        </div>
      `;
    });
    
    profileDiv.innerHTML = html;
  },

  populateParetoFrontier() {
    const paretoDiv = document.getElementById('paretoList');
    if (!paretoDiv) return;
    
    // Calculate Pareto frontier
    const results = state.results.rankings;
    const allResults = state.alternatives;
    const matrix = state.performanceMatrix;
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    
    // Find non-dominated alternatives
    const paretoAlternatives = [];
    
    for (let i = 0; i < allResults.length; i++) {
      let isDominated = false;
      
      for (let j = 0; j < allResults.length; j++) {
        if (i === j) continue;
        
        // Check if j dominates i
        let betterCount = 0;
        let worseCount = 0;
        
        for (let k = 0; k < activeCriteria.length; k++) {
          const critType = activeCriteria[k].type;
          const val_i = matrix[i][k];
          const val_j = matrix[j][k];
          
          if (critType === 'benefit') {
            if (val_j > val_i) betterCount++;
            if (val_j < val_i) worseCount++;
          } else {
            if (val_j < val_i) betterCount++;
            if (val_j > val_i) worseCount++;
          }
        }
        
        // j dominates i if better on all criteria
        if (betterCount > 0 && worseCount === 0) {
          isDominated = true;
          break;
        }
      }
      
      if (!isDominated) {
        paretoAlternatives.push(allResults[i].name);
      }
    }
    
    // Display Pareto frontier
    if (paretoAlternatives.length === 1) {
      paretoDiv.innerHTML = `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #1976d2;"><strong>✓ ${paretoAlternatives[0]}</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #666;">
            Questa è l'unica alternativa non dominata.
          </p>
        </div>
      `;
    } else if (paretoAlternatives.length === allResults.length) {
      paretoDiv.innerHTML = `
        <div style="background: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #f57c00;"><strong>⚠️ Tutte le alternative sono non dominate</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #666;">
            Non esiste una soluzione chiaramente superiore. Ogni alternativa ha pro e contro.
          </p>
          <ul style="margin: 10px 0 0 20px; padding: 0;">
            ${paretoAlternatives.map(alt => `<li style="margin: 4px 0;">${alt}</li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      paretoDiv.innerHTML = `
        <div style="background: #e8f5e9; padding: 15px; border-radius: 4px; border-left: 4px solid #4caf50;">
          <p style="margin: 0; color: #2e7d32;"><strong>✓ Soluzioni non dominate:</strong></p>
          <ul style="margin: 10px 0 0 20px; padding: 0;">
            ${paretoAlternatives.map(alt => `<li style="margin: 4px 0;">${alt}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  },

  populateMethodAgreement() {
    const contentDiv = document.getElementById('methodAgreementContent');
    if (!contentDiv) return;
    
    const results = state.results.rankings;
    
    // Sort by each method
    const wsmRanked = [...results].sort((a, b) => b.wsm - a.wsm);
    const topsisRanked = [...results].sort((a, b) => b.topsis - a.topsis);
    const vikorRanked = [...results].sort((a, b) => b.vikor - a.vikor);
    const ahpRanked = [...results].sort((a, b) => b.ahp - a.ahp);
    const bdtRanked = [...results].sort((a, b) => b.bdt - a.bdt);
    
    // Calculate concordance (count position matches among all 5 methods)
    let matches = 0;
    results.forEach(r => {
      const wsmPos = wsmRanked.findIndex(x => x.alternative === r.alternative);
      const topsisPos = topsisRanked.findIndex(x => x.alternative === r.alternative);
      const vikorPos = vikorRanked.findIndex(x => x.alternative === r.alternative);
      const ahpPos = ahpRanked.findIndex(x => x.alternative === r.alternative);
      const bdtPos = bdtRanked.findIndex(x => x.alternative === r.alternative);
      
      // Count how many methods agree on position
      const positions = [wsmPos, topsisPos, vikorPos, ahpPos, bdtPos];
      const uniquePositions = new Set(positions).size;
      if (uniquePositions <= 3) matches++; // At least 3 methods agree
    });
    
    const concordance = (matches / results.length);
    const interpretation = concordance >= 0.75 ? '✅ ALTA CONCORDANZA' :
                          concordance >= 0.50 ? '⚠️ ACCORDO MODERATO' :
                          '❌ BASSO ACCORDO';
    
    contentDiv.innerHTML += `
      <h4 style="margin-bottom: 15px;">Ranking per Metodo:</h4>
      <div style="margin-left: 20px; margin-bottom: 20px;">
        <p style="margin: 8px 0;"><strong>WSM:</strong> ${wsmRanked.map((r, i) => `${i+1}=${r.alternative}(${r.wsm.toFixed(0)})`).join(', ')}</p>
        <p style="margin: 8px 0;"><strong>TOPSIS:</strong> ${topsisRanked.map((r, i) => `${i+1}=${r.alternative}(${r.topsis.toFixed(0)})`).join(', ')}</p>
        <p style="margin: 8px 0;"><strong>VIKOR:</strong> ${vikorRanked.map((r, i) => `${i+1}=${r.alternative}(${r.vikor.toFixed(0)})`).join(', ')}</p>
        <p style="margin: 8px 0;"><strong>AHP:</strong> ${ahpRanked.map((r, i) => `${i+1}=${r.alternative}(${r.ahp.toFixed(0)})`).join(', ')}</p>
        <p style="margin: 8px 0;"><strong>BDT:</strong> ${bdtRanked.map((r, i) => `${i+1}=${r.alternative}(${r.bdt.toFixed(0)})`).join(', ')}</p>
      </div>
      
      <h4 style="margin-bottom: 10px;">Concordanza:</h4>
      <p style="margin: 8px 0; font-weight: 600; color: ${concordance >= 0.75 ? '#4caf50' : '#ff9800'};">
        ${interpretation}
      </p>
      <p style="margin: 8px 0; color: #666; font-size: 13px;">
        ${concordance >= 0.75 ? 'I cinque metodi concordano fortemente. Il ranking è affidabile e robusto.' :
          concordance >= 0.50 ? 'I metodi concordano moderatamente. Considera il contesto nella tua decisione.' :
          'I metodi discordano significativamente. Valuta attentamente tutte le prospettive.'}
      </p>
    `;
  },

  populateScenarios() {
    const results = state.results.rankings;
    
    // Pessimistic: -1 point from all scores
    const pessimistic = results.map(r => ({
      ...r,
      score: Math.max(0, r.score - 10)
    })).sort((a, b) => b.score - a.score);
    
    // Realistic: current
    const realistic = results;
    
    // Optimistic: +1 point to all scores
    const optimistic = results.map(r => ({
      ...r,
      score: Math.min(100, r.score + 10)
    })).sort((a, b) => b.score - a.score);
    
    const pesChanged = pessimistic[0].alternative !== realistic[0].alternative;
    const optChanged = optimistic[0].alternative !== realistic[0].alternative;
    
    document.getElementById('pessimisticResults').innerHTML = `
      <p style="margin: 0 0 8px 0;"><strong style="font-size: 16px; color: #d32f2f;">${pessimistic[0].alternative}</strong></p>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 13px;">${pessimistic[0].score.toFixed(1)}/100</p>
      <p style="margin: 0; padding: 8px; background: ${pesChanged ? '#ffcdd2' : '#c8e6c9'}; border-radius: 4px; font-size: 12px; color: ${pesChanged ? '#c62828' : '#2e7d32'};">
        ${pesChanged ? '⚠️ Ranking cambia!' : '✓ Ranking stabile'}
      </p>
    `;
    
    document.getElementById('realisticResults').innerHTML = `
      <p style="margin: 0 0 8px 0;"><strong style="font-size: 16px; color: #1b5e20;">${realistic[0].alternative}</strong></p>
      <p style="margin: 0; color: #666; font-size: 13px;">${realistic[0].score.toFixed(1)}/100</p>
      <p style="margin: 8px 0 0 0; padding: 8px; background: #e8f5e9; border-radius: 4px; font-size: 11px; color: #2e7d32;">
        (questo è il tuo risultato principale)
      </p>
    `;
    
    document.getElementById('optimisticResults').innerHTML = `
      <p style="margin: 0 0 8px 0;"><strong style="font-size: 16px; color: #0d47a1;">${optimistic[0].alternative}</strong></p>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 13px;">${optimistic[0].score.toFixed(1)}/100</p>
      <p style="margin: 0; padding: 8px; background: ${optChanged ? '#bbdefb' : '#c8e6c9'}; border-radius: 4px; font-size: 12px; color: ${optChanged ? '#01579b' : '#2e7d32'};">
        ${optChanged ? '⚠️ Ranking cambia!' : '✓ Ranking stabile'}
      </p>
    `;
    
    // Add interpretation
    const interpretDiv = document.getElementById('scenarioInterpretation');
    if (interpretDiv) {
      let interpretation = '';
      if (!pesChanged && !optChanged) {
        interpretation = '<strong>✓✓ RISULTATO MOLTO ROBUSTO:</strong> Il ranking rimane stabile in tutti gli scenari. La tua scelta è affidabile anche con variazioni nei punteggi.';
      } else if (pesChanged && optChanged) {
        interpretation = '<strong>⚠️ RISULTATO SENSIBILE:</strong> Il ranking cambia sia nello scenario pessimistico che ottimistico. La decisione è più incerta - considera attentamente i criteri più importanti.';
      } else {
        interpretation = '<strong>≈ RISULTATO MODERATAMENTE STABILE:</strong> Il ranking cambia solo in uno scenario estremo. La raccomandazione è ragionevolmente affidabile.';
      }
      interpretDiv.innerHTML = `<p style="margin: 0; font-size: 14px;">${interpretation}</p>`;
    }
  },

  displayMethodAgreement() {
    // Legacy function - now using populateMethodAgreement
    this.populateMethodAgreement();
  },

  displayMethodAgreementOLD() {
    const container = document.getElementById('method-agreement');
    const rankings = state.results.rankings;
    
    let html = '<div style="margin-bottom: 24px;">';
    html += '<h4 style="margin-bottom: 16px; font-size: var(--font-size-lg);">🔍 RANKING PER METODO</h4>';
    
    // Create rankings for each method
    const wsmRanking = [...rankings].sort((a, b) => b.wsm - a.wsm);
    const topsisRanking = [...rankings].sort((a, b) => b.topsis - a.topsis);
    const vikorRanking = [...rankings].sort((a, b) => b.vikor - a.vikor);
    
    // Display rankings side by side
    html += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">';
    
    // WSM
    html += '<div style="padding: 12px; background: var(--color-bg-1); border-radius: var(--radius-base);">';
    html += '<strong style="font-size: 13px; display: block; margin-bottom: 8px;">WSM (Weighted Sum)</strong>';
    wsmRanking.forEach((r, i) => {
      html += `<div style="font-size: 12px; padding: 4px 0; color: ${i === 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)'}; font-weight: ${i === 0 ? 'bold' : 'normal'};">` +
        `${i + 1}. ${r.alternative} (${r.wsm.toFixed(1)})</div>`;
    });
    html += '</div>';
    
    // TOPSIS
    html += '<div style="padding: 12px; background: var(--color-bg-2); border-radius: var(--radius-base);">';
    html += '<strong style="font-size: 13px; display: block; margin-bottom: 8px;">TOPSIS (Ideal Distance)</strong>';
    topsisRanking.forEach((r, i) => {
      html += `<div style="font-size: 12px; padding: 4px 0; color: ${i === 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)'}; font-weight: ${i === 0 ? 'bold' : 'normal'};">` +
        `${i + 1}. ${r.alternative} (${r.topsis.toFixed(1)})</div>`;
    });
    html += '</div>';
    
    // VIKOR
    html += '<div style="padding: 12px; background: var(--color-bg-3); border-radius: var(--radius-base);">';
    html += '<strong style="font-size: 13px; display: block; margin-bottom: 8px;">VIKOR (Compromise)</strong>';
    vikorRanking.forEach((r, i) => {
      html += `<div style="font-size: 12px; padding: 4px 0; color: ${i === 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)'}; font-weight: ${i === 0 ? 'bold' : 'normal'};">` +
        `${i + 1}. ${r.alternative} (${r.vikor.toFixed(1)})</div>`;
    });
    html += '</div>';
    
    html += '</div>';
    
    // Calculate Spearman correlation
    const spearman = this.calculateSpearmanCorrelation(wsmRanking, topsisRanking, vikorRanking);
    
    html += '<div style="padding: 16px; background: var(--color-bg-5); border-radius: var(--radius-base); margin-bottom: 16px;">';
    html += '<h4 style="margin-bottom: 8px;">📊 CONCORDANZA TRA METODI</h4>';
    html += `<div style="font-size: 13px; margin-bottom: 12px;"><strong>Correlazione di Spearman:</strong> ${spearman.toFixed(3)}</div>`;
    
    // Check agreement on top positions
    const top1 = rankings[0].alternative;
    const wsmTop1 = wsmRanking[0].alternative === top1;
    const topsisTop1 = topsisRanking[0].alternative === top1;
    const vikorTop1 = vikorRanking[0].alternative === top1;
    const agreementCount = (wsmTop1 ? 1 : 0) + (topsisTop1 ? 1 : 0) + (vikorTop1 ? 1 : 0);
    
    html += `<div style="font-size: 12px; color: var(--color-text-secondary);">`;
    html += `Posizione #1: <strong>${top1}</strong> ${wsmTop1 ? '✓WSM ' : ''}${topsisTop1 ? '✓TOPSIS ' : ''}${vikorTop1 ? '✓VIKOR' : ''} (${agreementCount}/3 accordo)<br>`;
    html += '</div></div>';
    
    // Interpretation
    html += '<div style="padding: 16px; background: ';
    if (spearman > 0.8 && agreementCount >= 2) {
      html += 'var(--color-bg-3); border-left: 4px solid var(--color-success);">';
      html += '<strong>✅ ALTA CONCORDANZA</strong><br>';
      html += '<div style="font-size: 12px; margin-top: 8px; color: var(--color-text-secondary);">I tre metodi concordano fortemente. Il ranking è <strong>AFFIDABILE e ROBUSTO</strong>.<br>';
      html += `La scelta di "${top1}" è supportata da evidenza forte. Anche variazioni nei pesi non cambieranno significativamente il ranking.</div>`;
    } else if (spearman > 0.5 || agreementCount >= 2) {
      html += 'var(--color-bg-2); border-left: 4px solid var(--color-warning);">';
      html += '<strong>≈ MEDIA CONCORDANZA</strong><br>';
      html += '<div style="font-size: 12px; margin-top: 8px; color: var(--color-text-secondary);">I metodi mostrano accordo moderato. Il ranking è <strong>RAGIONEVOLMENTE AFFIDABILE</strong>.<br>';
      html += 'Alcune variazioni nei pesi potrebbero influenzare il risultato. Verifica i criteri più importanti.</div>';
    } else {
      html += 'var(--color-bg-4); border-left: 4px solid var(--color-error);">';
      html += '<strong>⚠️ BASSA CONCORDANZA</strong><br>';
      html += '<div style="font-size: 12px; margin-top: 8px; color: var(--color-text-secondary);">I metodi mostrano disaccordo. Il ranking è <strong>SENSIBILE</strong> alla metodologia.<br>';
      html += 'Considera attentamente tutti i criteri e valuta se i pesi riflettono le tue priorità reali.</div>';
    }
    html += '</div>';
    
    html += '</div>';
    
    // Add similarity warning if scores are close
    const scoreDiff = state.results.scoreDiff || 0;
    if (scoreDiff < 5 && second) {
      html += `<div style="margin-top: 16px; padding: 12px; background: var(--color-bg-2); border-radius: var(--radius-base); border-left: 4px solid var(--color-warning);">`;
      html += `<strong>⚠️ ATTENZIONE - Alternative molto simili:</strong><br>`;
      html += `La differenza tra "${top.alternative}" (${top.score.toFixed(1)}) e "${second.alternative}" (${second.score.toFixed(1)}) è solo ${scoreDiff.toFixed(1)} punti. `;
      html += `Considera entrambe come opzioni valide e valuta altri fattori non inclusi in questa analisi.`;
      html += `</div>`;
    } else if (scoreDiff >= 5 && scoreDiff < 15 && second) {
      html += `<div style="margin-top: 16px; padding: 12px; background: var(--color-bg-3); border-radius: var(--radius-base);">`;
      html += `<strong>✓ Differenza moderata:</strong> "${top.alternative}" ha un vantaggio di ${scoreDiff.toFixed(1)} punti su "${second.alternative}". `;
      html += `La raccomandazione è affidabile ma valuta attentamente i criteri più importanti.`;
      html += `</div>`;
    } else if (second) {
      html += `<div style="margin-top: 16px; padding: 12px; background: var(--color-bg-1); border-radius: var(--radius-base);">`;
      html += `<strong>✓✓ Differenza significativa:</strong> "${top.alternative}" ha un chiaro vantaggio di ${scoreDiff.toFixed(1)} punti. `;
      html += `I tre metodi MCDM convergono sulla raccomandazione con alta confidenza.`;
      html += `</div>`;
    }
    
    container.innerHTML = html;
  },

  displaySensitivityAnalysis() {
    const container = document.getElementById('sensitivity-analysis');
    const analysis = state.results.sensitivityAnalysis;
    const variance = state.results.scoreVariance || 0;
    const scoreDiff = state.results.scoreDiff || 0;
    const avgScore = state.results.avgScore || 50;
    
    let html = '';
    
    // Overall confidence assessment
    let confidenceLevel = 'Alta';
    let confidenceColor = 'var(--color-bg-3)';
    let confidenceIcon = '✓✓';
    
    if (scoreDiff < 5 || variance > 100) {
      confidenceLevel = 'Bassa';
      confidenceColor = 'var(--color-bg-4)';
      confidenceIcon = '⚠️';
    } else if (scoreDiff < 15 || variance > 50) {
      confidenceLevel = 'Media';
      confidenceColor = 'var(--color-bg-2)';
      confidenceIcon = '≈';
    }
    
    html += `<div style="padding: 16px; background: ${confidenceColor}; border-radius: var(--radius-base); margin-bottom: 16px;">`;
    html += `<strong>${confidenceIcon} Confidenza Risultati: ${confidenceLevel}</strong><br>`;
    html += `<div style="font-size: 13px; margin-top: 8px; color: var(--color-text-secondary);">`;
    html += `Score medio: ${avgScore.toFixed(1)} | Varianza: ${variance.toFixed(2)} | Range: ${scoreDiff.toFixed(1)}<br>`;
    
    if (confidenceLevel === 'Bassa') {
      html += `Le alternative sono molto simili. La differenza è <strong>marginale</strong>. Considera altri fattori non quantificati.`;
    } else if (confidenceLevel === 'Media') {
      html += `Preferenza moderata. La scelta ha senso ma <strong>non è assoluta</strong>. Verifica i criteri più importanti.`;
    } else {
      html += `Differenza significativa. La raccomandazione è <strong>robusta e affidabile</strong>.`;
    }
    html += `</div></div>`;
    
    // Detailed sensitivity per criterion
    html += '<h4 style="margin: 24px 0 12px 0;">📊 Sensibilità per Criterio</h4>';
    html += '<div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 16px;">Mostra come cambia il vincitore variando il peso di ciascun criterio</div>';
    
    analysis.forEach((item, idx) => {
      const bgColor = item.stable ? 'var(--color-bg-3)' : 'var(--color-bg-4)';
      html += `<div style="padding: 14px; margin-bottom: 12px; background: ${bgColor}; border-radius: var(--radius-base); border-left: 4px solid ${item.stable ? 'var(--color-success)' : 'var(--color-warning)'};">`;
      html += `<strong style="font-size: 14px;">${item.criterion}</strong> `;
      html += `<span style="font-size: 11px; padding: 2px 8px; background: var(--color-surface); border-radius: 12px;">${item.sensitivity} sensibilità</span><br>`;
      
      if (item.variations && item.variations.length > 0) {
        html += '<div style="margin-top: 8px; font-size: 11px;"><table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: var(--color-surface);"><th style="padding: 4px; text-align: left;">Peso</th><th style="padding: 4px; text-align: left;">Vincitore</th><th style="padding: 4px;">Cambio?</th></tr>';
        
        const baseWinner = item.variations[0].winner;
        item.variations.forEach((v, i) => {
          const changed = v.winner !== baseWinner;
          html += `<tr style="font-size: 11px;"><td style="padding: 4px;">${v.weight}%</td><td style="padding: 4px; font-weight: ${i === 0 ? 'bold' : 'normal'};">${v.winner}</td>`;
          html += `<td style="padding: 4px; text-align: center;">${changed ? '⚠️' : '✓'}</td></tr>`;
        });
        
        html += '</table></div>';
        
        if (item.stable) {
          html += '<div style="margin-top: 8px; font-size: 11px; color: var(--color-text-secondary);">✓ <em>Ranking STABILE: anche variando il peso, il vincitore non cambia</em></div>';
        } else {
          html += '<div style="margin-top: 8px; font-size: 11px; color: var(--color-text-secondary);">⚠️ <em>Ranking SENSIBILE: aumentando il peso di questo criterio, il vincitore cambia</em></div>';
        }
      }
      
      html += '</div>';
    });
    
    container.innerHTML = html;
    
    // Sensitivity heatmap (text-based)
    this.displaySensitivityHeatmap();
  },

  displaySensitivityHeatmap() {
    const container = document.getElementById('sensitivity-heatmap');
    const analysis = state.results.sensitivityAnalysis;
    
    let html = '<h4 style="margin-bottom: 12px;">Mappa di Sensibilità</h4>';
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">';
    
    analysis.forEach(a => {
      const bgColor = a.stable ? 'var(--color-bg-3)' : 'var(--color-bg-4)';
      html += `
        <div style="padding: 12px; background: ${bgColor}; border-radius: var(--radius-sm); text-align: center;">
          <div style="font-size: 12px; font-weight: 500;">${a.criterion}</div>
          <div style="font-size: 20px; margin-top: 4px;">${a.stable ? '✓' : '⚠'}</div>
          <div style="font-size: 11px; color: var(--color-text-secondary);">${a.sensitivity}</div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  },

  displayDetailedExplanation() {
    const container = document.getElementById('detailed-explanation');
    const top = state.results.rankings[0];
    const second = state.results.rankings[1];
    const scoreDiff = state.results.scoreDiff || 0;
    
    let html = '<div class="explanation-section">';
    
    html += `<h4>Perché "${top.alternative}" è ${scoreDiff < 5 ? 'tra le scelte migliori' : 'la scelta migliore'}?</h4>`;
    
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    html += `<p>L'analisi multi-criterio V8.0 ha valutato ${state.alternatives.length} alternative attraverso ${activeCriteria.length} criteri ponderati. "${top.alternative}" emerge come ${scoreDiff < 5 ? 'una delle opzioni ottimali' : 'la scelta ottimale'} con uno score di ${top.score.toFixed(2)}/100 e una probabilità di selezione del ${top.confidence.toFixed(1)}%.</p>`;
    
    // Add interpretation guide
    html += `<div style="margin: 16px 0; padding: 12px; background: var(--color-bg-1); border-radius: var(--radius-base);">`;
    html += `<strong>📊 Guida Interpretazione Score:</strong><ul style="margin: 8px 0 0 20px; font-size: 13px;">`;
    html += `<li>Differenza 0-5 punti: Alternative <strong>MOLTO SIMILI</strong> - Considera entrambe</li>`;
    html += `<li>Differenza 5-15 punti: Alternative <strong>MODERATAMENTE DIVERSE</strong> - Preferenza chiara ma non assoluta</li>`;
    html += `<li>Differenza >15 punti: Alternative <strong>CHIARAMENTE DIVERSE</strong> - Raccomandazione forte</li>`;
    html += `</ul></div>`;
    
    html += '<h4>Fattori Chiave</h4><ul>';
    
    // Top 3 criteria for the winner
    const topCriteriaIndices = state.performanceMatrix[top.index]
      .map((val, idx) => ({ val, idx, weight: state.criteria[idx].weight }))
      .sort((a, b) => b.val * b.weight - a.val * a.weight)
      .slice(0, 3);
    
    topCriteriaIndices.forEach(item => {
      const crit = state.criteria[item.idx];
      html += `<li><strong>${crit.name}</strong>: punteggio ${item.val}/10 (peso ${crit.weight}%)</li>`;
    });
    
    html += '</ul>';
    
    if (second) {
      const scoreDiff = top.score - second.score;
      html += `<h4>Confronto con "${second.alternative}"</h4>`;
      html += `<p>"${top.alternative}" supera "${second.alternative}" di ${scoreDiff.toFixed(2)} punti. Questa differenza è ${scoreDiff > 10 ? 'significativa' : 'moderata'}, indicando ${scoreDiff > 10 ? 'una chiara preferenza' : 'che entrambe le opzioni meritano considerazione'}.</p>`;
    }
    
    html += '<h4>Metodologia V15.1 con 5 Algoritmi MCDM</h4>';
    html += '<p><strong>✨ Novità V15.1:</strong> <strong>BUG FIX CRITICO</strong> - Score Finale ora mostra il valore ensemble REALE (non più normalizzato al 100%). Esempio: se l\'ensemble è 80.38, viene mostrato 80.38 (non 100.0).</p>';
    html += '<p><strong>✨ V15+:</strong> <strong>15 famiglie di problema</strong> con criteri <strong>famiglia-specifici</strong> ottimizzati (incluso 🚗 Acquisto Nuova Vettura). Nessun criterio universale generico.</p>';
    html += '<p>Questa analisi combina 5 metodi MCDM differenti con inversione corretta dei costi:';
    html += '<ul>';
    html += '<li><strong>WSM</strong> (20%): Weighted Sum Method - somma ponderata diretta</li>';
    html += '<li><strong>TOPSIS</strong> (20%): Ideal Distance - distanza da soluzione ideale</li>';
    html += '<li><strong>VIKOR</strong> (20%): Compromise Solution - soluzione di compromesso</li>';
    html += '<li><strong>AHP</strong> (20%): Analytic Hierarchy Process - media geometrica</li>';
    html += '<li><strong>BDT</strong> (20%): Benefit-Cost Decision Tree - valutazione aggregata</li>';
    html += '</ul>';
    html += '<strong>✅ Caratteristiche V15.1:</strong>';
    html += '<ul style="font-size: 12px; color: var(--color-text-secondary);">';
    html += '<li>🐛 V15.1 FIX: Score Finale = valore ensemble REALE (media dei 5 algoritmi)</li>';
    html += '<li>🐛 V15.1 FIX: Rimossa ri-normalizzazione che forzava il top al 100%</li>';
    html += '<li>✓ 15 famiglie di problema (incluso 🚗 Acquisto Nuova Vettura)</li>';
    html += '<li>✓ Solo criteri famiglia-specifici (es. ${state.selectedFamily ? state.selectedFamily.nome : "famiglia selezionata"})</li>';
    html += '<li>✓ Criteri COSTO: invertiti (10-valore) per normalizzazione corretta</li>';
    html += '<li>✓ Inversione applicata PRIMA di calcolare min/max</li>';
    html += '<li>✓ Tutti i 5 algoritmi usano valori GIÀ INVERTITI (no doppia inversione)</li>';
    html += '<li>✓ Dopo inversione, tutti i criteri sono trattati come "beneficio" (alto=buono)</li>';
    html += '</ul></p>';
    
    html += '</div>';
    
    container.innerHTML = html;
  },

  displayFamilyMetrics() {
    const container = document.getElementById('family-metrics');
    if (!container) {
      console.warn("Family metrics container not found");
      return;
    }
    
    if (!state.results || !state.results.rankings || state.results.rankings.length === 0) {
      container.innerHTML = '<p>Nessun dato disponibile</p>';
      return;
    }
    
    // Always show generic metrics for simplicity
    this.displayGenericFamilyMetrics();
    return;
    
    // Check if we have the right family for detailed metrics
    if (!state.selectedFamily || state.selectedFamily.id !== '1_investimento_industriale') {
      // Generic metrics for other families
      this.displayGenericFamilyMetrics();
      return;
    }
    
    // Specific metrics for Investimento Industriale
    const top = state.results.rankings[0];
    const topIndex = top.index;
    
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    const matrix = state.performanceMatrix;
    
    // Find specific criteria from Investimento Industriale
    const findCritValue = (name) => {
      const critIndex = activeCriteria.findIndex(c => c.name.includes(name));
      return critIndex >= 0 ? matrix[topIndex][critIndex] : null;
    };
    
    const costoInv = findCritValue('Costo investimento');
    const savingAtteso = findCritValue('Saving atteso');
    const tempoReal = findCritValue('Tempo di realizzazione');
    const capacitaProd = findCritValue('Capacità produttiva');
    const efficienzaAttesa = findCritValue('Efficienza attesa');
    const costoManut = findCritValue('Costo manutenzione');
    
    let html = '<h4 style="margin-bottom: 16px;">🏭 Analisi Investimento Industriale: ' + top.alternative + '</h4>';
    html += '<div class="family-metrics">';
    
    if (costoInv !== null) {
      html += `
        <div class="family-metric-card">
          <div class="family-metric-label">Costo Investimento</div>
          <div class="family-metric-value">${costoInv.toFixed(1)}/10</div>
          <small style="font-size: 11px; color: var(--color-text-secondary);">${costoInv <= 4 ? 'Basso ✓' : costoInv <= 7 ? 'Medio' : 'Alto ⚠️'}</small>
        </div>
      `;
    }
    
    if (savingAtteso !== null) {
      html += `
        <div class="family-metric-card">
          <div class="family-metric-label">Saving Atteso</div>
          <div class="family-metric-value">${savingAtteso.toFixed(1)}/10</div>
          <small style="font-size: 11px; color: var(--color-text-secondary);">${savingAtteso >= 7 ? 'Eccellente 💪' : savingAtteso >= 5 ? 'Buono' : 'Limitato'}</small>
        </div>
      `;
    }
    
    if (tempoReal !== null) {
      html += `
        <div class="family-metric-card">
          <div class="family-metric-label">Tempo Realizzazione</div>
          <div class="family-metric-value">${tempoReal.toFixed(1)}/10</div>
          <small style="font-size: 11px; color: var(--color-text-secondary);">${tempoReal <= 4 ? 'Veloce ⚡' : tempoReal <= 7 ? 'Medio' : 'Lungo ⏳'}</small>
        </div>
      `;
    }
    
    if (capacitaProd !== null) {
      html += `
        <div class="family-metric-card">
          <div class="family-metric-label">Capacità Produttiva</div>
          <div class="family-metric-value">${capacitaProd.toFixed(1)}/10</div>
          <small style="font-size: 11px; color: var(--color-text-secondary);">${capacitaProd >= 7 ? 'Alta 🚀' : capacitaProd >= 5 ? 'Media' : 'Bassa'}</small>
        </div>
      `;
    }
    
    if (efficienzaAttesa !== null) {
      html += `
        <div class="family-metric-card">
          <div class="family-metric-label">Efficienza Attesa (OEE)</div>
          <div class="family-metric-value">${efficienzaAttesa.toFixed(1)}/10</div>
          <small style="font-size: 11px; color: var(--color-text-secondary);">${efficienzaAttesa >= 8.5 ? 'World Class 🏆' : efficienzaAttesa >= 6.5 ? 'Buona' : 'Da migliorare'}</small>
        </div>
      `;
    }
    
    if (costoManut !== null) {
      html += `
        <div class="family-metric-card">
          <div class="family-metric-label">Costo Manutenzione</div>
          <div class="family-metric-value">${costoManut.toFixed(1)}/10</div>
          <small style="font-size: 11px; color: var(--color-text-secondary);">${costoManut <= 4 ? 'Basso ✓' : costoManut <= 7 ? 'Medio' : 'Alto ⚠️'}</small>
        </div>
      `;
    }
    
    html += '</div>';
    
    // Add ROI estimation if we have cost and saving
    if (costoInv !== null && savingAtteso !== null && costoInv > 0 && savingAtteso > 0) {
      const roiYears = (10 - costoInv + 1) / (savingAtteso);
      html += `
        <div style="margin-top: 20px; padding: 16px; background: var(--color-bg-3); border-radius: var(--radius-base);">
          <strong>📊 Stima Payback Semplificato:</strong><br>
          <span style="font-size: 12px; color: var(--color-text-secondary);">Basato su punteggi relativi: circa ${roiYears.toFixed(1)} anni (indicativo)</span>
        </div>
      `;
    }
    
    // Add recommendations
    html += '<div style="margin-top: 20px; padding: 16px; background: var(--color-bg-1); border-radius: var(--radius-base);">';
    html += '<strong>💡 Raccomandazioni:</strong><ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">';
    
    if (costoInv !== null && costoInv > 7) {
      html += '<li>Costo investimento elevato: valuta opzioni di finanziamento o leasing</li>';
    }
    
    if (tempoReal !== null && tempoReal > 7) {
      html += '<li>Tempo di realizzazione lungo: pianifica risorse e milestone intermedi</li>';
    }
    
    if (efficienzaAttesa !== null && efficienzaAttesa < 6.5) {
      html += '<li>Efficienza attesa sotto media: considera formazione team e ottimizzazione processo</li>';
    }
    
    if (costoManut !== null && costoManut > 7) {
      html += '<li>Costi di manutenzione elevati: valuta contratti full-service con fornitore</li>';
    }
    
    html += '</ul></div>';
    
    container.innerHTML = html;
  },

  displayGenericFamilyMetrics() {
    const container = document.getElementById('family-metrics');
    if (!container) return;
    
    const top = state.results.rankings[0];
    const topIndex = top.index;
    const activeCriteria = state.criteria.filter(c => c.isIncluded);
    const matrix = state.performanceMatrix;
    
    let html = '<h4 style="margin-bottom: 16px;">';
    if (state.selectedFamily) {
      html += state.selectedFamily.emoji + ' Analisi: ' + top.alternative;
    } else {
      html += '🎯 Analisi: ' + top.alternative;
    }
    html += '</h4>';
    html += '<div class="family-metrics">';
    
    // Show top 6 criteria performances
    const topPerformances = matrix[topIndex]
      .map((val, idx) => ({ val, crit: activeCriteria[idx] }))
      .sort((a, b) => b.val * b.crit.weight - a.val * a.crit.weight)
      .slice(0, 6);
    
    topPerformances.forEach(item => {
      const scoreClass = item.val >= 7 ? '✅' : item.val >= 5 ? '✔️' : '⚠️';
      html += `
        <div class="family-metric-card">
          <div class="family-metric-label">${item.crit.name}</div>
          <div class="family-metric-value">${item.val.toFixed(1)}/10 ${scoreClass}</div>
          <small style="font-size: 11px; color: var(--color-text-secondary);">Peso: ${item.crit.weight.toFixed(0)}%</small>
        </div>
      `;
    });
    
    html += '</div>';
    
    html += '<div style="margin-top: 20px; padding: 16px; background: var(--color-bg-1); border-radius: var(--radius-base);">';
    html += '<strong>💡 Punti di Forza:</strong><ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">';
    
    const strengths = matrix[topIndex]
      .map((val, idx) => ({ val, crit: activeCriteria[idx] }))
      .filter(item => item.val >= 7)
      .slice(0, 3);
    
    if (strengths.length > 0) {
      strengths.forEach(item => {
        html += `<li>${item.crit.name}: eccellente (${item.val}/10)</li>`;
      });
    } else {
      html += '<li>Prestazioni bilanciate su tutti i criteri</li>';
    }
    
    html += '</ul></div>';
    
    container.innerHTML = html;
  },

  displayScenarios() {
    const tabsContainer = document.getElementById('scenario-tabs');
    const contentContainer = document.getElementById('scenario-content');
    
    if (!state.selectedFamily || state.selectedFamily.id !== '1_investimento_industriale') {
      tabsContainer.innerHTML = '';
      contentContainer.innerHTML = '';
      return;
    }
    
    // Scenario analysis for Investimento Industriale
    const scenarios = [
      { id: 'optimistic', name: 'Scenario Ottimistico', multiplier: 1.2 },
      { id: 'realistic', name: 'Scenario Realistico', multiplier: 1.0 },
      { id: 'pessimistic', name: 'Scenario Pessimistico', multiplier: 0.8 }
    ];
    
    let tabsHtml = '';
    scenarios.forEach((scenario, idx) => {
      tabsHtml += `<button class="scenario-tab ${idx === 1 ? 'active' : ''}" onclick="app.showScenario('${scenario.id}')">${scenario.name}</button>`;
    });
    
    tabsContainer.innerHTML = tabsHtml;
    
    // Show realistic scenario by default
    this.showScenario('realistic');
  },

  showScenario(scenarioId) {
    const contentContainer = document.getElementById('scenario-content');
    const top = state.results.rankings[0];
    
    const scenarios = {
      optimistic: {
        name: 'Scenario Ottimistico',
        description: 'Tutto procede meglio del previsto: implementazione rapida, saving superiori, bassi imprevisti.',
        adjustments: [
          'Saving atteso: +20%',
          'Tempo realizzazione: -20%',
          'Costi imprevisti: -30%',
          'Efficienza: +15%'
        ],
        result: (top.score * 1.15).toFixed(1)
      },
      realistic: {
        name: 'Scenario Realistico',
        description: 'Scenario base: valori come inseriti, con margine di tolleranza normale.',
        adjustments: [
          'Valori come inseriti',
          'Margine di sicurezza: ±10%',
          'Timeline nominale',
          'Budget nominale'
        ],
        result: top.score.toFixed(1)
      },
      pessimistic: {
        name: 'Scenario Pessimistico',
        description: 'Scenario worst-case: ritardi, costi extra, performance inferiori alle attese.',
        adjustments: [
          'Saving atteso: -25%',
          'Tempo realizzazione: +40%',
          'Costi extra: +30%',
          'Efficienza: -20%'
        ],
        result: (top.score * 0.75).toFixed(1)
      }
    };
    
    const scenario = scenarios[scenarioId];
    if (!scenario) return;
    
    // Update active tab
    document.querySelectorAll('.scenario-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.textContent === scenario.name) {
        tab.classList.add('active');
      }
    });
    
    let html = `
      <div style="padding: 20px; background: var(--color-surface); border-radius: var(--radius-base); border: 1px solid var(--color-card-border);">
        <h4 style="margin-bottom: 12px;">${scenario.name}</h4>
        <p style="color: var(--color-text-secondary); margin-bottom: 16px;">${scenario.description}</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
          <div>
            <strong style="font-size: 13px;">Assunzioni:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 12px; color: var(--color-text-secondary);">
    `;
    
    scenario.adjustments.forEach(adj => {
      html += `<li>${adj}</li>`;
    });
    
    html += `
            </ul>
          </div>
          <div style="text-align: center; padding: 16px; background: var(--color-bg-1); border-radius: var(--radius-base);">
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px;">Score Proiettato</div>
            <div style="font-size: 32px; font-weight: bold; color: var(--color-primary);">${scenario.result}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;">${scenario.result >= 70 ? 'Forte ✓' : scenario.result >= 50 ? 'Accettabile' : 'Critico ⚠️'}</div>
          </div>
        </div>
        
        <div style="padding: 12px; background: var(--color-bg-${scenarioId === 'optimistic' ? '3' : scenarioId === 'pessimistic' ? '4' : '2'}); border-radius: var(--radius-sm); font-size: 12px;">
          <strong>Implicazioni:</strong> 
    `;
    
    if (scenarioId === 'optimistic') {
      html += 'Se le condizioni sono favorevoli, l\'investimento può generare valore superiore. Considera incentivi o condizioni contrattuali bonus.';
    } else if (scenarioId === 'pessimistic') {
      html += 'In caso di difficoltà, l\'investimento potrebbe non raggiungere gli obiettivi. Valuta piani di contingenza, clausole di uscita, o garanzie di performance dal fornitore.';
    } else {
      html += 'Scenario di riferimento per la decisione. Usa margini di sicurezza del 10-15% su costi e tempi.';
    }
    
    html += '</div></div>';
    
    contentContainer.innerHTML = html;
  },

  // Export and actions
  exportResultsJSON() {
    const exportData = {
      problem: state.problem,
      alternatives: state.alternatives,
      criteria: state.criteria,
      performanceMatrix: state.performanceMatrix,
      preferences: state.preferences,
      results: state.results.rankings,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `decision-analysis-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  },

  modifyParameters() {
    this.showScreen('step1-screen');
  },

  exportResultsCSV() {
    const results = state.results.rankings;
    let csv = 'Rank,Alternative,Score,Confidence,TOPSIS,AHP,Bayesian,WSM\n';
    results.forEach((r, i) => {
      csv += `${i+1},${r.alternative},${r.score.toFixed(2)},${r.confidence.toFixed(2)},${r.topsis.toFixed(2)},${r.ahp.toFixed(2)},${r.bayesian.toFixed(2)},${r.wsm.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decision-analysis-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportPDF() {
    alert('Esportazione PDF: funzionalit\u00e0 che richiederebbe una libreria esterna. Per ora usa JSON/CSV.');
  },

  copyShareLink() {
    const shareData = {
      family: state.selectedFamily?.id,
      problem: state.problem.title,
      topChoice: state.results.rankings[0].alternative
    };
    const shareText = `Ho usato il Decision Support System per decidere: "${state.problem.title}". La mia scelta migliore \u00e8: ${shareData.topChoice}!`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Testo copiato negli appunti!');
      });
    } else {
      alert(shareText);
    }
  },

  // ============================================
  // NUOVA FUNZIONE: Ripristina Pesi Default
  // ============================================
  resetFamilyCriteria() {
    // Verifica che una famiglia sia selezionata
    if (!state.selectedFamily) {
      alert('❌ Nessuna famiglia selezionata');
      return;
    }

    // Prendi i criteri default dalla famiglia
    const defaultCriteria = state.selectedFamily.extraCriteria;

    // Ripristina lo stato
    state.criteria = defaultCriteria.map(c => ({
      ...c,
      isCore: false,
      isIncluded: true,  // Tutti abilitati
      locked: false,
      source: 'extra'
    }));

    // Rimuovi criteri custom
    state.customCriteria = [];

    // Aggiorna la visualizzazione
    this.renderCriteriaEnhanced();

    // Conferma all'utente
    alert('✅ Pesi ripristinati ai valori default della famiglia');
  }
};

// Tab switching functions for evaluation scales
function showBenefitScale() {
  document.getElementById('benefitScaleContent').style.display = 'block';
  document.getElementById('costScaleContent').style.display = 'none';
  document.getElementById('benefitScaleTab').style.background = 'var(--color-primary)';
  document.getElementById('benefitScaleTab').style.color = 'var(--color-btn-primary-text)';
  document.getElementById('costScaleTab').style.background = 'var(--color-secondary)';
  document.getElementById('costScaleTab').style.color = 'var(--color-text)';
}

function showCostScale() {
  document.getElementById('benefitScaleContent').style.display = 'none';
  document.getElementById('costScaleContent').style.display = 'block';
  document.getElementById('benefitScaleTab').style.background = 'var(--color-secondary)';
  document.getElementById('benefitScaleTab').style.color = 'var(--color-text)';
  document.getElementById('costScaleTab').style.background = 'var(--color-primary)';
  document.getElementById('costScaleTab').style.color = 'var(--color-btn-primary-text)';
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});