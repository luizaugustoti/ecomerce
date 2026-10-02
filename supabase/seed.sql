-- Dados iniciais da Botânica Bella (rode depois de schema.sql). Idempotente.
insert into public.produtos
  (nome, slug, preco, preco_promocional, categoria, linha, tipo_pele, beneficio, volume_tom, descricao, modo_uso, ingredientes, dicas)
values
  ('Sérum Vitamina C 15% + Ácido Ferúlico', 'serum-vitamina-c', 159.90, 129.90, 'skincare', 'facial', 'oleosa,mista,seca', 'brilho,anti-idade', '30 ml, 50 ml',
   'Sérum de alta potência com Vitamina C estabilizada a 15%, Ácido Ferúlico e Vitamina E. Combate os radicais livres, uniformiza o tom e devolve o viço natural da pele já nas primeiras semanas.
• Uniformiza manchas e marcas de acne
• Estimula a produção natural de colágeno
• Textura aquosa de rápida absorção
• Potencializa a ação do protetor solar',
   'Use pela manhã, após a limpeza e o tônico.
Aplique 4 a 5 gotas no rosto e pescoço.
Espalhe com leves batidinhas até a completa absorção.
Finalize com hidratante e protetor solar.',
   'Aqua, Ascorbic Acid, Propanediol, Glycerin, Ferulic Acid, Tocopherol, Sodium Hyaluronate, Citrus Aurantium Dulcis Peel Extract, Xanthan Gum, Sodium Benzoate, Potassium Sorbate.',
   'Guarde o frasco longe da luz e do calor para preservar a potência da Vitamina C. Uma leve mudança de cor com o tempo é natural.'),
  ('Hidratante Facial Ácido Hialurônico', 'hidratante-acido-hialuronico', 89.90, null, 'skincare', 'facial', 'seca,mista,oleosa', 'hidratacao,anti-idade', '50 g, 100 g',
   'Gel-creme com três pesos moleculares de Ácido Hialurônico, Niacinamida e extrato de Aloe Vera. Hidrata camadas profundas da pele, preenche linhas finas e deixa um toque aveludado, sem pesar.
• Hidratação comprovada por até 72h
• Fortalece a barreira cutânea
• Toque seco: ideal até para peles oleosas
• Não comedogênico',
   'Aplique manhã e noite sobre a pele limpa.
Use uma quantidade equivalente a um grão de ervilha.
Espalhe em movimentos ascendentes no rosto e pescoço.',
   'Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Aloe Barbadensis Leaf Juice, Squalane, Panthenol, Carbomer, Sodium Hydroxide, Phenoxyethanol.',
   'Aplique com a pele ainda levemente úmida: o ácido hialurônico retém mais água e o resultado fica visivelmente mais viçoso.'),
  ('Gel de Limpeza Purificante Chá Verde', 'gel-limpeza', 69.90, 59.90, 'skincare', 'facial', 'oleosa,mista', 'controle-oleosidade', '150 ml, 300 ml',
   'Gel de limpeza com tensoativos suaves derivados do coco, extrato de Chá Verde e Zinco PCA. Remove impurezas e excesso de oleosidade respeitando o pH natural da pele.
• Controla a oleosidade por até 8h
• Não agride a barreira cutânea
• Ação antioxidante do Chá Verde
• pH balanceado',
   'Umedeça o rosto com água morna.
Massageie uma pequena quantidade por 60 segundos.
Enxágue bem e seque com toalha macia, sem esfregar.',
   'Aqua, Sodium Cocoyl Glutamate, Coco-Glucoside, Glycerin, Camellia Sinensis Leaf Extract, Zinc PCA, Panthenol, Citric Acid, Sodium Benzoate.',
   'A “regra dos 60 segundos” faz diferença: massagear por um minuto inteiro dá tempo para os ativos agirem e a limpeza ficar completa.'),
  ('Tônico Facial Água de Rosas', 'tonico-rosas', 54.90, null, 'skincare', 'facial', 'seca,mista,oleosa', 'hidratacao', null,
   'Tônico sem álcool com hidrolato de Rosa Damascena, Pantenol e Alantoína. Reequilibra o pH após a limpeza, acalma e prepara a pele para absorver melhor os ativos seguintes.
• Sem álcool
• Acalma vermelhidão e sensibilidade
• Aumenta a absorção dos séruns
• Fragrância natural de rosas',
   'Após a limpeza, borrife a 20 cm do rosto ou aplique com algodão.
Deixe secar naturalmente antes do sérum.
Pode ser usado ao longo do dia para refrescar.',
   'Rosa Damascena Flower Water, Glycerin, Panthenol, Allantoin, Betaine, Lactic Acid, Sodium Benzoate, Potassium Sorbate.',
   'Mantenha na geladeira nos dias quentes: o efeito refrescante ajuda a desinchar a área dos olhos pela manhã.'),
  ('Creme Noturno Bakuchiol Renovador', 'creme-noturno-bakuchiol', 179.90, 149.90, 'skincare', 'facial', 'seca,mista', 'anti-idade,hidratacao', '30 g, 50 g',
   'Creme noturno com 1% de Bakuchiol, Peptídeos e Óleo de Rosa Mosqueta. Suaviza linhas de expressão e melhora a firmeza com a eficácia do retinol — sem irritação e seguro para peles sensíveis.
• Reduz linhas finas em 4 semanas*
• Melhora firmeza e elasticidade
• Não fotossensibiliza
• Textura nutritiva que não pesa',
   'Use à noite, após o tônico.
Aplique no rosto, pescoço e colo com movimentos ascendentes.
Pela manhã, use protetor solar normalmente.',
   'Aqua, Caprylic/Capric Triglyceride, Bakuchiol, Rosa Canina Fruit Oil, Palmitoyl Tripeptide-5, Butyrospermum Parkii Butter, Glycerin, Cetearyl Alcohol, Tocopherol, Phenoxyethanol.',
   'Leve o restinho do creme para o dorso das mãos: é uma das primeiras áreas a mostrar sinais do tempo.'),
  ('Protetor Solar Facial FPS 50 com Cor', 'protetor-solar', 94.90, 79.90, 'skincare', 'facial', 'oleosa,mista,seca', 'anti-idade,controle-oleosidade', 'Clara #F1D3BC, Média #D9AE8C, Morena #B07D5A, Escura #7A5038',
   'Protetor com FPS 50 e PPD 20, filtros de amplo espectro e pigmentos que uniformizam o tom. Acabamento matte natural, resistente ao suor e com proteção contra luz azul.
• Proteção UVA, UVB e luz visível
• Cor que se adapta à pele
• Efeito matte por até 8h
• Pode ser usado como base leve',
   'Aplique como último passo do skincare da manhã.
Use o equivalente a dois dedos de produto para rosto e pescoço.
Reaplique a cada 2 horas de exposição solar.',
   'Aqua, Zinc Oxide, Titanium Dioxide, Caprylic/Capric Triglyceride, Silica, Iron Oxides, Glycerin, Tocopherol, Polyglyceryl-3 Polyricinoleate, Phenoxyethanol.',
   'A quantidade certa é tudo: a regra dos “dois dedos” garante que você realmente receba o FPS indicado no rótulo.'),
  ('Óleo Capilar Reparador Argan & Pracaxi', 'oleo-capilar', 84.90, 69.90, 'cabelos', 'capilar', null, 'brilho,hidratacao', '30 ml, 60 ml',
   'Blend de óleos amazônicos de Pracaxi e Argan com Vitamina E. Sela as cutículas, reduz o frizz e devolve o brilho espelhado sem deixar os fios oleosos.
• Reduz o frizz em até 90%
• Proteção térmica até 230 °C
• Sela pontas duplas
• Livre de silicones',
   'Aplique 2 a 3 gotas nas mãos e espalhe.
Distribua do comprimento às pontas, com fios úmidos ou secos.
Evite a raiz.',
   'Pentaclethra Macroloba Seed Oil, Argania Spinosa Kernel Oil, Caprylic/Capric Triglyceride, Tocopherol, Parfum (natural).',
   'Antes de dormir, aplique uma gota extra nas pontas e prenda o cabelo em um coque frouxo: ao acordar, os fios estarão muito mais macios.'),
  ('Máscara de Nutrição Murumuru', 'mascara-capilar', 79.90, null, 'cabelos', 'capilar', null, 'hidratacao,brilho', 'Baunilha, Coco, Sem perfume',
   'Máscara cremosa com Manteiga de Murumuru, Óleo de Coco e Proteína Vegetal de Quinoa. Repõe lipídios, devolve maciez e maleabilidade aos fios ressecados ou com química.
• Nutrição profunda em 5 minutos
• Libera o low poo e no poo
• Maciez e movimento
• Desembaraço instantâneo',
   'Após o shampoo, retire o excesso de água dos fios.
Aplique mecha a mecha, do comprimento às pontas.
Deixe agir de 5 a 10 minutos e enxágue.',
   'Aqua, Cetearyl Alcohol, Astrocaryum Murumuru Seed Butter, Cocos Nucifera Oil, Hydrolyzed Quinoa, Behentrimonium Methosulfate, Glycerin, Parfum, Phenoxyethanol.',
   'Uma vez por semana, cubra os cabelos com uma touca térmica durante a pausa: o calor abre as cutículas e potencializa a nutrição.'),
  ('Shampoo Low Poo Alecrim & Menta', 'shampoo-alecrim', 49.90, null, 'cabelos', 'capilar', null, 'controle-oleosidade,brilho', '300 ml, 500 ml',
   'Shampoo de limpeza suave com extrato de Alecrim, óleo essencial de Menta e Biotina. Estimula o couro cabeludo, equilibra a oleosidade e fortalece os fios desde a raiz.
• Reduz a queda por quebra
• Sensação refrescante
• Low poo: sem sulfatos agressivos
• Para uso diário',
   'Aplique no couro cabeludo molhado.
Massageie com as pontas dos dedos por 2 minutos.
Enxágue e repita se necessário.',
   'Aqua, Sodium Lauroyl Sarcosinate, Cocamidopropyl Betaine, Rosmarinus Officinalis Leaf Extract, Mentha Piperita Oil, Biotin, Panthenol, Citric Acid, Sodium Benzoate.',
   'Concentre o shampoo na raiz: a espuma que escorre já é suficiente para limpar o comprimento sem ressecar.'),
  ('Batom Líquido Matte Hidratante', 'batom-liquido', 59.90, 49.90, 'maquiagem', 'facial', null, 'hidratacao', 'Rosé Nude #C9918A, Terracota #B5603F, Malva #A0606F, Vermelho Clássico #A3262E',
   'Batom líquido de alta pigmentação com Manteiga de Karité e Ácido Hialurônico. Acabamento matte aveludado que não craquela nem resseca os lábios.
• Alta fixação: até 10h
• Não transfere após secar
• Hidrata enquanto colore
• Aplicador de precisão',
   'Comece contornando o centro do lábio superior.
Preencha do centro para os cantos.
Aguarde 30 segundos para secar.',
   'Isododecane, Polyglyceryl-2 Triisostearate, Butyrospermum Parkii Butter, Sodium Hyaluronate, Kaolin, Silica, Tocopherol, CI 77491, CI 77492, CI 77499, CI 15850.',
   'Esfolie os lábios com açúcar e o Óleo de Argan antes da aplicação: o matte fica uniforme e muito mais confortável.'),
  ('Base Sérum Glow', 'base-serum', 99.90, null, 'maquiagem', 'facial', 'seca,mista', 'brilho,hidratacao', '01 Porcelana #F3D9C5, 02 Areia #E5BE9C, 03 Mel #CC9B72, 04 Canela #A8714B, 05 Cacau #7D5034, 06 Ébano #5A3826',
   'Base em textura sérum com Niacinamida e Esqualano. Cobertura leve a média construível, acabamento luminoso “pele de verdade” e tratamento enquanto você usa.
• Cobertura construível
• Acabamento glow natural
• 6 tons inclusivos
• Hidrata por 12h',
   'Agite antes de usar.
Aplique 1 a 2 pumps no dorso da mão.
Espalhe com os dedos ou esponja úmida, do centro para fora.',
   'Aqua, Squalane, Niacinamide, Glycerin, Caprylic/Capric Triglyceride, Mica, CI 77891, CI 77491, CI 77492, CI 77499, Tocopherol, Phenoxyethanol.',
   'Misture uma gota da base ao hidratante nos dias em que quiser apenas um efeito “pele descansada”.'),
  ('Manteiga Corporal Nutritiva', 'manteiga-corporal', 79.90, 69.90, 'skincare', 'corporal', 'seca,mista,oleosa', 'hidratacao', 'Cacau & Baunilha, Flor de Laranjeira, Lavanda',
   'Manteiga corporal com Karité, Cupuaçu e Óleo de Amêndoas. Derrete ao toque, nutre intensamente e deixa um perfume delicado na pele.
• Hidratação por até 48h
• Absorção rápida
• Ideal para áreas muito secas
• Embalagem 100% reciclável',
   'Aplique após o banho, com a pele levemente úmida.
Massageie em movimentos circulares até absorver.
Reforce em cotovelos, joelhos e pés.',
   'Aqua, Butyrospermum Parkii Butter, Theobroma Grandiflorum Seed Butter, Prunus Amygdalus Dulcis Oil, Glycerin, Cetearyl Alcohol, Parfum (natural), Tocopherol, Phenoxyethanol.',
   'Aplique nos três primeiros minutos após o banho: a pele ainda está com os poros abertos e absorve muito mais.'),
  ('Kit Rotina Facial Completa', 'kit-rotina-facial', 359.60, 299.90, 'kits', 'facial', 'oleosa,mista,seca', 'hidratacao,brilho,anti-idade', null,
   'Tudo o que sua pele precisa em uma caixa presenteável: Gel de Limpeza Chá Verde, Sérum Vitamina C 15%, Hidratante Ácido Hialurônico e Protetor FPS 50 com Cor (tom Média).
• 4 produtos em tamanho original
• Caixa presente reutilizável
• Cartão personalizado grátis
• Rotina guiada passo a passo',
   'Manhã: limpeza → Vitamina C → hidratante → FPS 50.
Noite: limpeza → hidratante.
Siga o guia ilustrado que acompanha o kit.',
   'Consulte a composição completa de cada item na página individual do produto.',
   'Para presentear, escolha a opção “cartão personalizado” no checkout e escreva sua mensagem — enviamos sem nota fiscal visível na caixa.'),
  ('Kit Presente Cabelos Radiantes', 'kit-cabelos', 199.70, 169.90, 'kits', 'capilar', null, 'brilho,hidratacao', null,
   'O cronograma completo para fios fortes e brilhantes: Shampoo Low Poo Alecrim & Menta, Máscara de Nutrição Murumuru (Baunilha) e Óleo Reparador Argan & Pracaxi 30 ml.
• 3 produtos em tamanho original
• Ideal para cronograma capilar
• Caixa presente reutilizável
• Cartão personalizado grátis',
   'Lave com o shampoo focando na raiz.
Aplique a máscara no comprimento por 5 a 10 min.
Finalize com o óleo nas pontas.',
   'Consulte a composição completa de cada item na página individual do produto.',
   'Intercale a máscara com dias apenas de condicionador para não sobrecarregar fios finos.')
on conflict (slug) do nothing;

-- Saldo inicial (alguns itens abaixo do mínimo para demonstrar os alertas)
update public.estoque e
   set quantidade = case p.slug
         when 'batom-liquido' then 3
         when 'base-serum' then 4
         when 'kit-cabelos' then 2
         when 'shampoo-alecrim' then 6
         else 40 end
  from public.produtos p
 where p.id = e.produto_id and e.quantidade = 0;
