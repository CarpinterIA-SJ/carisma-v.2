-- ============================================================
-- SEED — Dados mock para testes
-- Execute APÓS o schema.sql
-- ============================================================

-- GRUPOS
insert into public.grupos (id, nome, descricao, dia_semana, horario, endereco, coordenador_id, secretario_id, tesoureiro_id, status, fundado_em, total_servos, paroquia) values
('g-001', 'Cenáculo Pentecostes', 'Grupo de oração da Catedral, com foco em jovens e adultos.', 'Quarta-feira', '19:30',
  '{"rua":"Praça da Sé","numero":"50","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}',
  's-001','s-002','s-003','aprovado','2015-05-12',24,'Catedral São João Batista'),
('g-002', 'Águas Vivas', 'Grupo voltado para casais e famílias.', 'Sexta-feira', '20:00',
  '{"rua":"Rua das Flores","numero":"120","bairro":"Vila Nova","cidade":"Barreiras","estado":"BA","cep":"47802-100"}',
  's-004','s-005','s-006','aprovado','2018-03-20',18,'Paróquia Sagrado Coração'),
('g-003', 'Fogo do Espírito', 'Grupo jovem da Paróquia São José.', 'Terça-feira', '19:00',
  '{"rua":"Av. ACM","numero":"1500","bairro":"Sandra Regina","cidade":"Barreiras","estado":"BA","cep":"47805-000"}',
  's-007',null,null,'aprovado','2020-08-01',32,'Paróquia São José'),
('g-004', 'Maranatha', 'Novo grupo de oração do Bairro Barreirinhas.', 'Quinta-feira', '19:30',
  '{"rua":"Rua São Pedro","numero":"78","bairro":"Barreirinhas","cidade":"Barreiras","estado":"BA","cep":"47810-200"}',
  's-008','s-009','s-010','pendente','2025-03-01',8,'Paróquia Nossa Senhora Aparecida'),
('g-005', 'Vinde Espírito Santo', 'Grupo da Paróquia Santa Rita.', 'Segunda-feira', '19:30',
  '{"rua":"Rua Santa Rita","numero":"300","bairro":"Recanto dos Pássaros","cidade":"Barreiras","estado":"BA","cep":"47820-500"}',
  's-011',null,null,'pendente','2025-02-15',6,'Paróquia Santa Rita')
on conflict (id) do nothing;

-- SERVOS
insert into public.servos (id, grupo_id, nome, email, telefone, data_nascimento, endereco, funcao, etapas_formativas, ministerios, ingresso_em) values
('s-001','g-001','Maria das Graças Souza','maria@email.com','(77) 98000-1000','1980-01-10','{"rua":"Rua das Acácias","numero":"100","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Coordenador(a)',array['Aprofundamento de Dons','Vida Cristã 2'],array['Música','Pregação'],'2020-01-15'),
('s-002','g-001','João Batista Lima','joão@email.com','(77) 98001-1013','1981-02-11','{"rua":"Rua das Acácias","numero":"101","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Secretário(a)',array['Seminário de Vida no Espírito Santo'],array['Intercessão','Acolhida'],'2021-02-15'),
('s-003','g-001','Ana Cláudia Pereira','ana@email.com','(77) 98002-1026','1982-03-12','{"rua":"Rua das Acácias","numero":"102","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Tesoureiro(a)',array['Seminário de Vida no Espírito Santo','Vida Cristã 1'],array['Jovens','Comunicação'],'2022-03-15'),
('s-004','g-002','Pedro Henrique Santos','pedro@email.com','(77) 98003-1039','1983-04-13','{"rua":"Rua das Acácias","numero":"103","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Coordenador(a)',array['Experiência de Oração','Vida de Oração'],array['Música','Pregação'],'2020-04-15'),
('s-005','g-002','Mariana Oliveira','mariana@email.com','(77) 98004-1052','1984-05-14','{"rua":"Rua das Acácias","numero":"104","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Secretário(a)',array['Seminário de Vida no Espírito Santo'],array['Intercessão','Acolhida'],'2021-05-15'),
('s-006','g-002','Carlos Eduardo Rocha','carlos@email.com','(77) 98005-1065','1985-06-15','{"rua":"Rua das Acácias","numero":"105","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Tesoureiro(a)',array['Seminário de Vida no Espírito Santo'],array['Jovens','Comunicação'],'2022-06-15'),
('s-007','g-003','Luciana Ferreira','luciana@email.com','(77) 98006-1078','1986-07-16','{"rua":"Rua das Acácias","numero":"106","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Coordenador(a)',array['Aprofundamento de Dons','Igreja'],array['Música','Pregação'],'2020-07-15'),
('s-008','g-004','Rafael Mendes','rafael@email.com','(77) 98007-1091','1987-08-17','{"rua":"Rua das Acácias","numero":"107","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Coordenador(a)',array['Seminário de Vida no Espírito Santo'],array['Intercessão','Acolhida'],'2021-08-15'),
('s-009','g-004','Beatriz Cardoso','beatriz@email.com','(77) 98008-1004','1988-09-18','{"rua":"Rua das Acácias","numero":"108","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Secretário(a)',array['Seminário de Vida no Espírito Santo'],array['Jovens','Comunicação'],'2022-09-15'),
('s-010','g-004','Tiago Almeida','tiago@email.com','(77) 98009-1017','1989-01-19','{"rua":"Rua das Acácias","numero":"109","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Tesoureiro(a)',array['Experiência de Oração'],array['Música','Pregação'],'2020-10-15'),
('s-011','g-005','Helena Costa','helena@email.com','(77) 98010-1030','1980-02-10','{"rua":"Rua das Acácias","numero":"110","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Coordenador(a)',array['Aprofundamento de Dons','Vida Cristã 2'],array['Intercessão','Acolhida'],'2021-11-15'),
('s-012','g-001','Marcos Vinícius','marcos@email.com','(77) 98011-1043','1981-03-11','{"rua":"Rua das Acácias","numero":"111","bairro":"Centro","cidade":"Barreiras","estado":"BA","cep":"47800-000"}','Servo(a)',array['Seminário de Vida no Espírito Santo'],array['Jovens','Comunicação'],'2022-12-15')
on conflict (id) do nothing;

-- MENSALIDADES (grupos aprovados: g-001, g-002, g-003)
insert into public.mensalidades (id, grupo_id, mes, ano, valor, vencimento, status, data_pagamento) values
('m-g-001-1','g-001',1,2025,50,'2025-01-10','pago','2025-01-08'),
('m-g-001-2','g-001',2,2025,50,'2025-02-10','pago','2025-02-08'),
('m-g-001-3','g-001',3,2025,50,'2025-03-10','pago','2025-03-08'),
('m-g-001-4','g-001',4,2025,50,'2025-04-10','validacao',null),
('m-g-001-5','g-001',5,2025,50,'2025-05-10','pendente',null),
('m-g-001-6','g-001',6,2025,50,'2025-06-10','atrasado',null),
('m-g-002-1','g-002',1,2025,50,'2025-01-10','pago','2025-01-08'),
('m-g-002-2','g-002',2,2025,50,'2025-02-10','pago','2025-02-08'),
('m-g-002-3','g-002',3,2025,50,'2025-03-10','pago','2025-03-08'),
('m-g-002-4','g-002',4,2025,50,'2025-04-10','validacao',null),
('m-g-002-5','g-002',5,2025,50,'2025-05-10','pendente',null),
('m-g-002-6','g-002',6,2025,50,'2025-06-10','atrasado',null),
('m-g-003-1','g-003',1,2025,50,'2025-01-10','pago','2025-01-08'),
('m-g-003-2','g-003',2,2025,50,'2025-02-10','pago','2025-02-08'),
('m-g-003-3','g-003',3,2025,50,'2025-03-10','pago','2025-03-08'),
('m-g-003-4','g-003',4,2025,50,'2025-04-10','validacao',null),
('m-g-003-5','g-003',5,2025,50,'2025-05-10','pendente',null),
('m-g-003-6','g-003',6,2025,50,'2025-06-10','atrasado',null)
on conflict (id) do nothing;

-- RECIBOS (das mensalidades pagas)
insert into public.recibos (id, codigo, grupo_id, valor, descricao, emitido_em) values
('r-1','REC-2025-0001','g-001',50,'Mensalidade Janeiro/2025','2025-01-08'),
('r-2','REC-2025-0002','g-001',50,'Mensalidade Fevereiro/2025','2025-02-08'),
('r-3','REC-2025-0003','g-001',50,'Mensalidade Março/2025','2025-03-08'),
('r-4','REC-2025-0004','g-002',50,'Mensalidade Janeiro/2025','2025-01-08'),
('r-5','REC-2025-0005','g-002',50,'Mensalidade Fevereiro/2025','2025-02-08'),
('r-6','REC-2025-0006','g-002',50,'Mensalidade Março/2025','2025-03-08'),
('r-7','REC-2025-0007','g-003',50,'Mensalidade Janeiro/2025','2025-01-08'),
('r-8','REC-2025-0008','g-003',50,'Mensalidade Fevereiro/2025','2025-02-08'),
('r-9','REC-2025-0009','g-003',50,'Mensalidade Março/2025','2025-03-08')
on conflict (id) do nothing;

-- EVENTOS
insert into public.eventos (id, titulo, descricao, tipo, status, data, hora_inicio, hora_fim, local, cidade, vagas, inscritos, organizador) values
('e-001','Assembleia Diocesana 2025','Assembleia anual dos coordenadores e servos da RCC Diocesana.','Assembleia','agendado','2025-06-21','08:00','17:00','Centro Diocesano de Eventos','Barreiras',200,array['s-001','s-002','s-003','s-004'],'RCC Diocesana de Barreiras'),
('e-002','Congresso de Renovação 2025','Congresso regional com pregadores nacionais.','Congresso','agendado','2025-09-12','08:00','22:00','Estádio Geraldão','Barreiras',1500,array['s-001','s-002','s-003','s-004','s-005','s-006','s-007','s-008','s-009','s-010','s-011','s-012'],'RCC Diocesana de Barreiras'),
('e-003','Cenáculo de Pentecostes','Cenáculo com vigília de oração na noite de Pentecostes.','Cenáculo','agendado','2025-06-07','19:00','23:00','Catedral São João Batista','Barreiras',300,array['s-001','s-002','s-003','s-004','s-005','s-006','s-007','s-008'],'Catedral'),
('e-004','Encontro de Jovens','Encontro voltado para jovens dos grupos de oração.','Encontro','concluido','2025-03-15','14:00','21:00','Salão Paroquial São José','Barreiras',120,array['s-001','s-002','s-003','s-004','s-005','s-006'],'Paróquia São José'),
('e-005','Caravana ao Hosana Brasil','Caravana com saída de Barreiras para o evento nacional.','Caravana','agendado','2025-10-10','06:00','23:59','Aparecida do Norte/SP','Aparecida',45,array['s-001','s-002','s-003','s-004'],'RCC Diocesana de Barreiras')
on conflict (id) do nothing;
