// Catálogo e conteúdo da loja. Edite aqui marca, produtos, depoimentos e rotinas.
window.STORE = {
  BRAND: {
    name: 'Lumis Star',
    slogan: 'Beleza que realça sua essência',
    freeShippingThreshold: 199,
    // Cupons e regras de frete/Pix também são validados em criar_pedido (supabase/schema.sql)
    coupons: { BEMVINDO10: 10 },
    pixDiscount: 0.05,
    maxInstallments: 10,
    minInstallment: 10,
    whatsapp: '',
    email: '',
    freeFrom: [],
  },

  CATEGORIES: {
    skincare: { name: 'Skincare', desc: 'Limpeza, tratamento e proteção com ativos botânicos para todos os tipos de pele.' },
    cabelos: { name: 'Cabelos', desc: 'Nutrição, força e brilho para fios saudáveis — do couro cabeludo às pontas.' },
    maquiagem: { name: 'Maquiagem', desc: 'Maquiagem que cuida: cor, conforto e skincare na mesma fórmula.' },
    gloss: { name: 'Gloss & Lábios', desc: 'Brilho intenso, efeito molhado e cores para realçar sua expressão.' },
    perfumes: { name: 'Perfumes', desc: 'Fragrâncias para acompanhar cada momento e revelar seu estilo.' },
    kits: { name: 'Kits & Presentes', desc: 'Rotinas completas com preço especial. Perfeitos para presentear (ou se presentear).' },
    promocoes: { name: 'Promoções', desc: 'Seleção especial Lumis Star por tempo limitado.' },
  },

  LINES: { facial: 'Linha Facial', corporal: 'Linha Corporal', capilar: 'Linha Capilar' },
  SKIN_TYPES: { oleosa: 'Oleosa', seca: 'Seca', mista: 'Mista' },
  BENEFITS: { hidratacao: 'Hidratação', 'anti-idade': 'Anti-idade', brilho: 'Brilho', 'controle-oleosidade': 'Controle de oleosidade' },

  // Ilustrações decorativas (hero e categorias). Os produtos vêm do Supabase.
  DECOR: {
    'gloss-lumis-star': { name: 'Gloss Lumis Star', shape: 'wand', color: '#A71936', capColor: '#D7B77F', label: 'LUMIS STAR', bgIndex: 0 },
    'categoria-maquiagem': { name: 'Maquiagem Lumis Star', shape: 'wand', color: '#A71936', capColor: '#D7B77F', label: 'LUMIS', bgIndex: 0 },
    'categoria-perfumes': { name: 'Perfumes Lumis Star', shape: 'pump', color: '#6D1930', capColor: '#D7B77F', label: 'LUMIS', bgIndex: 3 },
    'categoria-kits': { name: 'Kits Lumis Star', shape: 'kit', color: '#E4D2B5', capColor: '#A71936', label: 'LUMIS', bgIndex: 2 },
    'serum-vitamina-c': { name: 'Sérum Vitamina C', shape: 'dropper', color: '#E9B872', capColor: '#2B2B2B', label: 'VIT C 15%', bgIndex: 2 },
    'hidratante-acido-hialuronico': { name: 'Hidratante Ácido Hialurônico', shape: 'jar', color: '#BCD3DA', capColor: '#6E8B74', label: 'H.A. 72H', bgIndex: 1 },
    'tonico-rosas': { name: 'Tônico Água de Rosas', shape: 'pump', color: '#E7B9C2', capColor: '#9E5F6D', label: 'ROSAS', bgIndex: 0 },
    'creme-noturno-bakuchiol': { name: 'Creme Noturno Bakuchiol', shape: 'jar', color: '#D8A7B1', capColor: '#2B2B2B', label: 'BAKUCHIOL', bgIndex: 0 },
    'oleo-capilar': { name: 'Óleo Capilar Argan', shape: 'dropper', color: '#C9964A', capColor: '#2B2B2B', label: 'ARGAN', bgIndex: 2 },
    'manteiga-corporal': { name: 'Manteiga Corporal', shape: 'jar', color: '#C8A27C', capColor: '#2B2B2B', label: 'BODY', bgIndex: 3 },
    'kit-rotina-facial': { name: 'Kit Rotina Facial', shape: 'kit', color: '#E9D6C4', capColor: '#9E5F6D', label: 'KIT', bgIndex: 0 },
  },

  // Substitua "photo" por fotos reais (com autorização de uso de imagem).
  TESTIMONIALS: [
    { name: 'Camila Rocha', city: 'São Paulo, SP', rating: 5, product: 'serum-vitamina-c', color: '#D8A7B1', photo: '',
      text: 'Em três semanas minhas manchas de sol clarearam visivelmente. A textura é levíssima e não deixa a pele grudando.' },
    { name: 'Juliana Freitas', city: 'Belo Horizonte, MG', rating: 5, product: 'oleo-capilar', color: '#6E8B74', photo: '',
      text: 'Meu cabelo cacheado nunca teve tanto brilho. Rende muito, uso 2 gotinhas e acabou o frizz.' },
    { name: 'Rodrigo Alves', city: 'Curitiba, PR', rating: 5, product: 'protetor-solar', color: '#C9964A', photo: '',
      text: 'Finalmente um protetor que não deixa meu rosto oleoso nem branco. Uso todo dia antes do trabalho.' },
    { name: 'Patrícia Nunes', city: 'Recife, PE', rating: 4, product: 'creme-noturno-bakuchiol', color: '#9E5F6D', photo: '',
      text: 'Tenho pele sensível e nunca consegui usar retinol. Com o bakuchiol acordo com a pele macia e sem irritação.' },
    { name: 'Larissa Moura', city: 'Porto Alegre, RS', rating: 5, product: 'kit-rotina-facial', color: '#4F6B56', photo: '',
      text: 'Dei o kit de presente para minha mãe e ela amou. A caixa é linda e chegou em 2 dias!' },
    { name: 'Beatriz Santos', city: 'Rio de Janeiro, RJ', rating: 5, product: 'batom-liquido', color: '#B4566A', photo: '',
      text: 'O tom Terracota é perfeito. Fica o dia inteiro e não resseca, coisa rara em batom matte.' },
  ],

  ROUTINES: {
    manha: {
      label: 'Manhã', icon: 'sun',
      steps: [
        { product: 'gel-limpeza', title: 'Limpeza', time: '1 min', text: 'Remove a oleosidade acumulada durante a noite e prepara a pele, sem agredir a barreira cutânea.' },
        { product: 'tonico-rosas', title: 'Tonificação', time: '30 seg', text: 'Reequilibra o pH e deixa a pele pronta para absorver melhor os ativos dos próximos passos.' },
        { product: 'serum-vitamina-c', title: 'Tratamento', time: '1 min', text: 'O antioxidante mais potente da rotina: ilumina, uniformiza e potencializa a proteção contra poluição e sol.' },
        { product: 'hidratante-acido-hialuronico', title: 'Hidratação', time: '1 min', text: 'Sela os ativos e mantém a pele hidratada e confortável durante todo o dia.' },
        { product: 'protetor-solar', title: 'Proteção', time: '1 min', text: 'Passo indispensável — mesmo em dias nublados. Reaplique a cada 2 horas se houver exposição.' },
      ],
    },
    noite: {
      label: 'Noite', icon: 'moon',
      steps: [
        { product: 'gel-limpeza', title: 'Limpeza', time: '1 min', text: 'Remove protetor, maquiagem e poluição do dia. Para maquiagem pesada, faça a limpeza duas vezes.' },
        { product: 'tonico-rosas', title: 'Tonificação', time: '30 seg', text: 'Acalma a pele depois de um dia inteiro de agressões externas.' },
        { product: 'creme-noturno-bakuchiol', title: 'Renovação', time: '1 min', text: 'Durante o sono a pele se regenera: é a hora ideal para ativos anti-idade como o bakuchiol.' },
        { product: 'manteiga-corporal', title: 'Cuidado corporal', time: '2 min', text: 'Finalize com uma massagem relaxante no corpo — um ritual de autocuidado antes de dormir.' },
      ],
    },
  },
};
