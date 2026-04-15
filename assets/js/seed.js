/**
 * seed.js — Demo data seeding to Firebase Auth + Firestore
 * Exposes window._seedPromise so auth.js waits for seeding before
 * registering onAuthStateChanged, ensuring _authReady sees a clean null state.
 * Rede D'Or Portal de Atendimento
 */

'use strict';

// ── SEED PROMISE (synchronous — must exist before auth.js loads) ─────────────
let _seedResolve;
window._seedPromise = new Promise(resolve => { _seedResolve = resolve; });

(async function seedFirebase() {
  // Fast path: already seeded
  if (localStorage.getItem('sdr_fs_seeded_v2')) {
    _seedResolve();
    return;
  }

  /* ── SEED USERS ─────────────────────────────────────────────────────── */
  // Passwords removed from source code — accounts already exist in Firebase Auth.
  // Credentials are managed privately via the admin panel (Painel → Usuários → Credenciais Internas).
  const SEED_USERS = [
    { numericId: 1, name: 'Miguel Vieira',     email: 'miguel.vieiraa@rededor.com.br',    password: '', role: 'admin',   department: 'Marketing',        sector: null,  initials: 'MV', active: true },
    { numericId: 2, name: 'Leonardo Achilles', email: 'leonardo.achilles@rededor.com.br', password: '', role: 'analyst', department: 'Design & Criação', sector: 'ART', initials: 'LA', active: true },
    { numericId: 3, name: 'Isabelle Monteiro', email: 'isabelle.monteiro@rededor.com.br', password: '', role: 'analyst', department: 'Eventos',          sector: 'EVT', initials: 'IM', active: true },
    { numericId: 4, name: 'Thereza Gerhard',   email: 'thereza.gerhard@rededor.com.br',   password: '', role: 'analyst', department: 'Patrocínio',       sector: 'PAT', initials: 'TG', active: true },
    { numericId: 5, name: 'Maria Santos',      email: 'maria.santos@rededor.com.br',      password: '', role: 'user',    department: 'Comunicação',      sector: null,  initials: 'MS', active: true },
    { numericId: 6, name: 'João Oliveira',     email: 'joao.oliveira@rededor.com.br',     password: '', role: 'user',    department: 'RH',               sector: null,  initials: 'JO', active: true },
  ];

  /* ── DATE HELPERS ────────────────────────────────────────────────────── */
  const DAY = 86400000;
  const now = Date.now();
  const ago    = (d, h = 0) => new Date(now - d * DAY - h * 3600000).toISOString();
  const future = (d)         => new Date(now + d * DAY).toISOString();

  /* ── SEED TICKETS ────────────────────────────────────────────────────── */
  const SEED_TICKETS = [
    /* ART */
    { id: 'ART-384721', type: 'ART', title: 'Banner campanha Black Friday 2026', status: 'resolvido', priority: 'alto', userId: 5, analystId: 2, createdAt: ago(45), updatedAt: ago(5), deadline: ago(8), resolvedAt: ago(5), slaStatus: 'no_prazo', history: [{ date: ago(45), status: 'aberto', note: 'Ticket aberto via briefing de criação.', author: 'Maria Santos' }, { date: ago(42), status: 'em_andamento', note: 'Iniciando desenvolvimento visual.', author: 'Leonardo Achilles' }, { date: ago(5), status: 'resolvido', note: 'Arte finalizada e enviada. Aprovada pelo cliente.', author: 'Leonardo Achilles' }] },
    { id: 'ART-291043', type: 'ART', title: 'Kit de identidade visual para campanha interna', status: 'em_andamento', priority: 'normal', userId: 5, analystId: 2, createdAt: ago(20), updatedAt: ago(2), deadline: future(10), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(20), status: 'aberto', note: 'Ticket aberto via briefing.', author: 'Maria Santos' }, { date: ago(18), status: 'em_andamento', note: 'Reunião de briefing realizada. Iniciando conceito visual.', author: 'Leonardo Achilles' }] },
    { id: 'ART-503817', type: 'ART', title: 'Post redes sociais — Dia dos Médicos', status: 'resolvido', priority: 'urgente', userId: 6, analystId: 2, createdAt: ago(60), updatedAt: ago(55), deadline: ago(57), resolvedAt: ago(55), slaStatus: 'urgencia', history: [{ date: ago(60), status: 'aberto', note: 'Solicitação urgente para data comemorativa.', author: 'João Oliveira' }, { date: ago(59), status: 'em_andamento', note: 'Priorizando entrega.', author: 'Leonardo Achilles' }, { date: ago(55), status: 'resolvido', note: 'Post finalizado e entregue.', author: 'Leonardo Achilles' }] },
    { id: 'ART-174982', type: 'ART', title: 'Material impresso — cartaz A3 para consultório', status: 'fechado', priority: 'normal', userId: 5, analystId: 2, createdAt: ago(90), updatedAt: ago(78), deadline: ago(80), resolvedAt: ago(78), slaStatus: 'atrasado', history: [{ date: ago(90), status: 'aberto', note: 'Ticket aberto.', author: 'Maria Santos' }, { date: ago(85), status: 'em_andamento', note: 'Aguardando conteúdo textual.', author: 'Leonardo Achilles' }, { date: ago(78), status: 'resolvido', note: 'Material finalizado.', author: 'Leonardo Achilles' }, { date: ago(75), status: 'fechado', note: 'Solicitante confirmou recebimento.', author: 'Maria Santos' }] },
    { id: 'ART-628304', type: 'ART', title: 'Apresentação corporativa Q3 2026', status: 'aberto', priority: 'alto', userId: 6, analystId: null, createdAt: ago(3), updatedAt: ago(3), deadline: future(7), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(3), status: 'aberto', note: 'Ticket aberto via briefing de criação.', author: 'João Oliveira' }] },
    { id: 'ART-759013', type: 'ART', title: 'Vídeo institucional — versão 30s para Instagram', status: 'em_andamento', priority: 'alto', userId: 5, analystId: 2, createdAt: ago(14), updatedAt: ago(1), deadline: future(4), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(14), status: 'aberto', note: 'Ticket aberto.', author: 'Maria Santos' }, { date: ago(12), status: 'em_andamento', note: 'Script aprovado. Iniciando edição.', author: 'Leonardo Achilles' }] },
    { id: 'ART-830541', type: 'ART', title: 'Adesivos personalizados para evento de saúde', status: 'resolvido', priority: 'normal', userId: 5, analystId: 2, createdAt: ago(30), updatedAt: ago(18), deadline: ago(20), resolvedAt: ago(18), slaStatus: 'no_prazo', history: [{ date: ago(30), status: 'aberto', note: 'Ticket aberto.', author: 'Maria Santos' }, { date: ago(27), status: 'em_andamento', note: 'Desenvolvendo layout.', author: 'Leonardo Achilles' }, { date: ago(18), status: 'resolvido', note: 'Arte finalizada e enviada para gráfica.', author: 'Leonardo Achilles' }] },
    { id: 'ART-941200', type: 'ART', title: 'E-mail marketing — Newsletter Julho', status: 'aberto', priority: 'normal', userId: 6, analystId: null, createdAt: ago(1), updatedAt: ago(1), deadline: future(14), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(1), status: 'aberto', note: 'Ticket aberto via briefing.', author: 'João Oliveira' }] },
    { id: 'ART-062715', type: 'ART', title: 'Crachás para convenção médica', status: 'fechado', priority: 'urgente', userId: 5, analystId: 2, createdAt: ago(55), updatedAt: ago(40), deadline: ago(50), resolvedAt: ago(40), slaStatus: 'atrasado', history: [{ date: ago(55), status: 'aberto', note: 'Solicitação com prazo apertado.', author: 'Maria Santos' }, { date: ago(53), status: 'em_andamento', note: 'Problemas técnicos na aprovação. Retrabalho necessário.', author: 'Leonardo Achilles' }, { date: ago(40), status: 'resolvido', note: 'Crachás finalizados após revisões.', author: 'Leonardo Achilles' }, { date: ago(38), status: 'fechado', note: 'Entregues na convenção.', author: 'Maria Santos' }] },
    { id: 'ART-113489', type: 'ART', title: 'Infográfico de resultados assistenciais 2025', status: 'em_andamento', priority: 'alto', userId: 6, analystId: 2, createdAt: ago(10), updatedAt: ago(4), deadline: future(6), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(10), status: 'aberto', note: 'Ticket aberto.', author: 'João Oliveira' }, { date: ago(8), status: 'em_andamento', note: 'Coletando dados com equipe de BI.', author: 'Leonardo Achilles' }] },
    { id: 'ART-224561', type: 'ART', title: 'Capa de relatório anual — design executivo', status: 'aberto', priority: 'normal', userId: 5, analystId: null, createdAt: ago(2), updatedAt: ago(2), deadline: future(21), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(2), status: 'aberto', note: 'Ticket aberto via briefing de criação.', author: 'Maria Santos' }] },
    /* EVT */
    { id: 'EVT-551823', type: 'EVT', title: 'Simpósio de Cardiologia — setembro 2026', status: 'em_andamento', priority: 'alto', userId: 5, analystId: 3, createdAt: ago(25), updatedAt: ago(3), deadline: future(45), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(25), status: 'aberto', note: 'Ticket aberto via briefing de eventos.', author: 'Maria Santos' }, { date: ago(22), status: 'em_andamento', note: 'Reserva de espaço confirmada. Iniciando logística.', author: 'Isabelle Monteiro' }] },
    { id: 'EVT-662904', type: 'EVT', title: 'Workshop de Humanização do Atendimento', status: 'resolvido', priority: 'normal', userId: 6, analystId: 3, createdAt: ago(50), updatedAt: ago(35), deadline: ago(38), resolvedAt: ago(35), slaStatus: 'no_prazo', history: [{ date: ago(50), status: 'aberto', note: 'Ticket aberto.', author: 'João Oliveira' }, { date: ago(47), status: 'em_andamento', note: 'Confirmados 45 participantes.', author: 'Isabelle Monteiro' }, { date: ago(35), status: 'resolvido', note: 'Workshop realizado com sucesso. 43 participantes.', author: 'Isabelle Monteiro' }] },
    { id: 'EVT-774015', type: 'EVT', title: 'Festa de integração equipe de TI', status: 'fechado', priority: 'normal', userId: 5, analystId: 3, createdAt: ago(75), updatedAt: ago(60), deadline: ago(65), resolvedAt: ago(60), slaStatus: 'atrasado', history: [{ date: ago(75), status: 'aberto', note: 'Ticket aberto.', author: 'Maria Santos' }, { date: ago(70), status: 'em_andamento', note: 'Demora na aprovação interna do orçamento.', author: 'Isabelle Monteiro' }, { date: ago(60), status: 'resolvido', note: 'Evento realizado com 5 dias de atraso.', author: 'Isabelle Monteiro' }, { date: ago(58), status: 'fechado', note: 'Processo encerrado. Feedback positivo.', author: 'João Oliveira' }] },
    { id: 'EVT-885127', type: 'EVT', title: 'Lançamento do Programa de Bem-Estar Corporativo', status: 'aberto', priority: 'urgente', userId: 6, analystId: null, createdAt: ago(1), updatedAt: ago(1), deadline: future(5), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(1), status: 'aberto', note: 'Evento com data definida pela diretoria. Urgente.', author: 'João Oliveira' }] },
    { id: 'EVT-996238', type: 'EVT', title: 'Treinamento de Liderança — Módulo II', status: 'em_andamento', priority: 'normal', userId: 5, analystId: 3, createdAt: ago(18), updatedAt: ago(5), deadline: future(20), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(18), status: 'aberto', note: 'Ticket aberto.', author: 'Maria Santos' }, { date: ago(16), status: 'em_andamento', note: 'Palestrantes confirmados. Montando cronograma.', author: 'Isabelle Monteiro' }] },
    { id: 'EVT-107349', type: 'EVT', title: 'Ação de saúde nas unidades — campanha de vacinação', status: 'resolvido', priority: 'urgente', userId: 6, analystId: 3, createdAt: ago(40), updatedAt: ago(28), deadline: ago(30), resolvedAt: ago(28), slaStatus: 'urgencia', history: [{ date: ago(40), status: 'aberto', note: 'Ação emergencial solicitada pela diretoria médica.', author: 'João Oliveira' }, { date: ago(39), status: 'em_andamento', note: 'Mobilização imediata. Equipes contactadas.', author: 'Isabelle Monteiro' }, { date: ago(28), status: 'resolvido', note: 'Ação realizada em 12 unidades. 800 colaboradores vacinados.', author: 'Isabelle Monteiro' }] },
    { id: 'EVT-218450', type: 'EVT', title: 'Confraternização de final de ano 2026', status: 'aberto', priority: 'normal', userId: 5, analystId: null, createdAt: ago(4), updatedAt: ago(4), deadline: future(120), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(4), status: 'aberto', note: 'Planejamento antecipado conforme solicitação da diretoria.', author: 'Maria Santos' }] },
    { id: 'EVT-329561', type: 'EVT', title: 'Webinar: Inovação em Saúde Digital', status: 'em_andamento', priority: 'alto', userId: 6, analystId: 3, createdAt: ago(12), updatedAt: ago(2), deadline: future(8), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(12), status: 'aberto', note: 'Ticket aberto via briefing.', author: 'João Oliveira' }, { date: ago(10), status: 'em_andamento', note: 'Plataforma Zoom reservada. Palestrante confirmado.', author: 'Isabelle Monteiro' }] },
    /* PAT */
    { id: 'PAT-440672', type: 'PAT', title: 'Patrocínio — Maratona São Paulo 2026', status: 'em_andamento', priority: 'alto', userId: 5, analystId: 4, createdAt: ago(35), updatedAt: ago(10), deadline: future(30), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(35), status: 'aberto', note: 'Proposta recebida para análise.', author: 'Maria Santos' }, { date: ago(30), status: 'em_andamento', note: 'Em análise pelo jurídico e diretoria de marketing.', author: 'Thereza Gerhard' }] },
    { id: 'PAT-551783', type: 'PAT', title: 'Parceria — Congresso Brasileiro de Medicina', status: 'resolvido', priority: 'normal', userId: 6, analystId: 4, createdAt: ago(80), updatedAt: ago(55), deadline: ago(60), resolvedAt: ago(55), slaStatus: 'no_prazo', history: [{ date: ago(80), status: 'aberto', note: 'Proposta enviada pelo organizador do congresso.', author: 'João Oliveira' }, { date: ago(75), status: 'em_andamento', note: 'Negociação de contrapartidas em andamento.', author: 'Thereza Gerhard' }, { date: ago(55), status: 'resolvido', note: 'Contrato assinado. Cota master confirmada.', author: 'Thereza Gerhard' }] },
    { id: 'PAT-662894', type: 'PAT', title: 'Patrocínio — Festival Literário Saúde & Bem-Estar', status: 'fechado', priority: 'normal', userId: 5, analystId: 4, createdAt: ago(100), updatedAt: ago(85), deadline: ago(90), resolvedAt: ago(85), slaStatus: 'atrasado', history: [{ date: ago(100), status: 'aberto', note: 'Proposta avaliada internamente.', author: 'Maria Santos' }, { date: ago(95), status: 'em_andamento', note: 'Aguardando aprovação orçamentária.', author: 'Thereza Gerhard' }, { date: ago(85), status: 'resolvido', note: 'Patrocínio aprovado com cota reduzida.', author: 'Thereza Gerhard' }, { date: ago(82), status: 'fechado', note: 'Contrapartidas cumpridas. Processo encerrado.', author: 'Maria Santos' }] },
    { id: 'PAT-773905', type: 'PAT', title: 'Apoio institucional — Projeto Saúde na Escola', status: 'aberto', priority: 'normal', userId: 6, analystId: null, createdAt: ago(2), updatedAt: ago(2), deadline: future(30), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(2), status: 'aberto', note: 'Proposta recebida de ONG parceira.', author: 'João Oliveira' }] },
    { id: 'PAT-884016', type: 'PAT', title: 'Cota de patrocínio — Liga Acadêmica de Cardiologia', status: 'resolvido', priority: 'urgente', userId: 5, analystId: 4, createdAt: ago(22), updatedAt: ago(12), deadline: ago(15), resolvedAt: ago(12), slaStatus: 'urgencia', history: [{ date: ago(22), status: 'aberto', note: 'Prazo curto para resposta à liga acadêmica.', author: 'Maria Santos' }, { date: ago(21), status: 'em_andamento', note: 'Análise acelerada a pedido da diretoria médica.', author: 'Thereza Gerhard' }, { date: ago(12), status: 'resolvido', note: 'Cota aprovada e contrato enviado.', author: 'Thereza Gerhard' }] },
    { id: 'PAT-995127', type: 'PAT', title: 'Parceria de mídia — Portal de Saúde Online', status: 'em_andamento', priority: 'normal', userId: 6, analystId: 4, createdAt: ago(8), updatedAt: ago(3), deadline: future(22), resolvedAt: null, slaStatus: 'no_prazo', history: [{ date: ago(8), status: 'aberto', note: 'Proposta de permuta enviada pelo portal.', author: 'João Oliveira' }, { date: ago(6), status: 'em_andamento', note: 'Avaliando métricas e audiência do portal.', author: 'Thereza Gerhard' }] },
  ];

  try {
    let ticketsSeeded = false;

    /* ── CREATE / VERIFY FIREBASE AUTH ACCOUNTS + USER PROFILES ────────── */
    for (const u of SEED_USERS) {
      const { password, ...profile } = u;

      try {
        // Attempt to create account
        const cred = await auth.createUserWithEmailAndPassword(u.email, password);
        await db.collection('users').doc(cred.user.uid).set(profile);
        console.log('[Seed] Conta criada:', u.email);

        if (!ticketsSeeded) {
          ticketsSeeded = true;
          try {
            const existingCheck = await db.collection('tickets').limit(1).get();
            if (existingCheck.empty) {
              const batch = db.batch();
              SEED_TICKETS.forEach(t => {
                const { id, ...data } = t;
                batch.set(db.collection('tickets').doc(id), data);
              });
              await batch.commit();
              console.log('[Seed] Tickets criados.');
            }
          } catch (te) {
            console.warn('[Seed] Tickets error:', te.message);
          }
        }

        try { await auth.signOut(); } catch (_) {}

      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          // Account exists in Firebase Auth.
          // Only sign in if we still need to create the Firestore profile or seed tickets.
          // Avoids unnecessary login attempts (and failures if password was changed).
          if (!ticketsSeeded) {
            try {
              const cred = await auth.signInWithEmailAndPassword(u.email, password);
              const doc = await db.collection('users').doc(cred.user.uid).get();
              if (!doc.exists) {
                await db.collection('users').doc(cred.user.uid).set(profile);
                console.log('[Seed] Perfil criado para conta existente:', u.email);
              }
              ticketsSeeded = true;
              try {
                const existingCheck = await db.collection('tickets').limit(1).get();
                if (existingCheck.empty) {
                  const batch = db.batch();
                  SEED_TICKETS.forEach(t => {
                    const { id, ...data } = t;
                    batch.set(db.collection('tickets').doc(id), data);
                  });
                  await batch.commit();
                  console.log('[Seed] Tickets criados.');
                }
              } catch (te) {
                console.warn('[Seed] Tickets error:', te.message);
              }
            } catch (signInErr) {
              // Password may have been changed by user — skip silently
              // Firestore profile was created in a previous seed run
              console.log('[Seed] Skip sign-in para conta existente:', u.email);
            } finally {
              try { if (auth.currentUser) await auth.signOut(); } catch (_) {}
            }
          }
          // If ticketsSeeded is already true, no need to sign in at all
        } else {
          console.warn('[Seed] Erro ao criar conta:', u.email, e.message);
        }
        try { if (auth.currentUser) await auth.signOut(); } catch (_) {}
      }
    }

    console.log('[Seed] Concluído.');
  } catch (e) {
    console.error('[Seed] Falhou:', e);
  } finally {
    // Always ensure signed out, then set flag, then resolve
    try { if (auth.currentUser) await auth.signOut(); } catch (_) {}
    localStorage.setItem('sdr_fs_seeded_v2', '1');
    _seedResolve();
  }
})();
