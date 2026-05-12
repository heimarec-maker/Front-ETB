-- ============================================================
-- DATOS DE PRUEBA - Limpieza de Equipos ETB
-- ============================================================

-- Equipos de ejemplo
INSERT OR IGNORE INTO equipment (equipment_id, serial_nbr, model, brand, tipo, estado) VALUES
  (1, 'ETB-SRL-001', 'HG8245H', 'Huawei', 'ONT', 'ACTIVO'),
  (2, 'ETB-SRL-002', 'EchoLife', 'Huawei', 'CPE', 'ACTIVO'),
  (3, 'ETB-SRL-003', 'TL-WR840N', 'TP-Link', 'MODEM', 'RETIRADO'),
  (4, 'ETB-SRL-004', 'HG8310M', 'Huawei', 'ONT', 'ACTIVO'),
  (5, 'ETB-SRL-005', 'DG3450', 'ARRIS', 'MODEM', 'LIBRE'),
  (6, 'ZTEGDB0DCC99', 'F680', 'ZTE', 'ONT', 'ACTIVO'),
  (7, 'ZTEQA065JI5G', 'ONT Standard', 'ZTE', 'ONT', 'ACTIVO'),
  (8, 'SZTEONTDUA10', 'ONT Dual Band', 'ZTE', 'ONT', 'ACTIVO'),
  (9, 'ZTEG87654328', 'ONT ATP', 'ZTE', 'ONT', 'ACTIVO'),
  (10, '6534A0031331010000228588', 'STB Digital', 'Generic', 'STB', 'ACTIVO'),
  (11, 'APFEDCBA000008', 'Access Point', 'Generic', 'AP', 'ACTIVO'),
  (12, 'TVBOXSN0000001', 'TV Box 4K', 'Generic', 'TV BOX', 'ACTIVO');

-- Atributos (Estado CPE) para cada equipo
INSERT OR IGNORE INTO equip_ca_value (equipment_id, ca_value_label, ca_value) VALUES
  (1, 'Estado CPE', 'ACTIVO'),
  (1, 'Tipo Conexión', 'FTTH'),
  (2, 'Estado CPE', 'ACTIVO'),
  (2, 'Tipo Conexión', 'ADSL'),
  (3, 'Estado CPE', 'RETIRADO'),
  (3, 'Tipo Conexión', 'CABLE'),
  (4, 'Estado CPE', 'ACTIVO'),
  (4, 'Tipo Conexión', 'FTTH'),
  (5, 'Estado CPE', 'LIBRE'),
  (5, 'Tipo Conexión', 'FTTH'),
  (6, 'Estado CPE', 'ACTIVO'),
  (6, 'Tipo Conexión', 'FTTH'),
  (7, 'Estado CPE', 'ACTIVO'),
  (7, 'Dirección MAC', 'AAAAAAAAA115'),
  (8, 'Estado CPE', 'ACTIVO'),
  (8, 'Dirección MAC', 'D84732C06001'),
  (9, 'Estado CPE', 'ACTIVO'),
  (9, 'Dirección MAC', 'AAAAAAAAB342'),
  (10, 'Estado CPE', 'ACTIVO'),
  (10, 'Dirección MAC', '0C565C0220LD'),
  (11, 'Estado CPE', 'ACTIVO'),
  (11, 'Dirección MAC', 'FEDCBA000008'),
  (12, 'Estado CPE', 'ACTIVO'),
  (12, 'Dirección MAC', 'TVBOXSN0000001'); -- Aquí la MAC es idéntica al Serial

-- Ítems de servicio con serial vinculado
INSERT OR IGNORE INTO serv_item_value (serv_item_id, value_label, valid_value, service_id) VALUES
  (101, 'Serial', 'ETB-SRL-001', 5001),
  (102, 'Serial', 'ETB-SRL-002', 5002),
  (103, 'Serial', 'ETB-SRL-003', 5003),
  (104, 'Serial', 'ETB-SRL-004', 5004),
  (105, 'Serial', 'ZTEGDB0DCC99', 5005),
  (106, 'Serial', 'ZTEQA065JI5G', 5006),
  (107, 'Serial', 'SZTEONTDUA10', 5007),
  (108, 'Serial', 'ZTEG87654328', 5008),
  (109, 'Serial', '6534A0031331010000228588', 5009),
  (110, 'Serial', 'APFEDCBA000008', 5010),
  (111, 'Serial', 'TVBOXSN0000001', 5011);

-- Ítems de solicitudes/órdenes con serial
INSERT OR IGNORE INTO serv_req_si_value (serv_req_id, value_label, valid_value, orden_estado) VALUES
  (201, 'Serial', 'ETB-SRL-001', 'ACTIVA'),
  (202, 'Serial', 'ETB-SRL-002', 'ACTIVA'),
  (203, 'Serial', 'ETB-SRL-003', 'CERRADA'),
  (204, 'Serial', 'ETB-SRL-004', 'PENDIENTE'),
  (205, 'Serial', 'ZTEQA065JI5G', 'ACTIVA'),
  (206, 'Serial', 'SZTEONTDUA10', 'PENDIENTE'),
  (207, 'Serial', '6534A0031331010000228588', 'ACTIVA'),
  (208, 'Serial', 'ZTEGDB0DCC99', 'ACTIVA');
