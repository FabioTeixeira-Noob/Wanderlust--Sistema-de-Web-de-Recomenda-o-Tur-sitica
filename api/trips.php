<?php
// ============================================================
//  WANDERLUST — Viagens planeadas
//  POST /api/trips.php   → criar planeamento
//  GET  /api/trips.php?user_id=1  → listar viagens do utilizador
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDB();

    // ── GET — listar viagens ─────────────────────────────────
    if ($method === 'GET') {
        $userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
        if (!$userId) json_error(400, 'user_id inválido.');

        $stmt = $db->prepare('
            SELECT id, destination_id, destination_name, date_from, date_to,
                   adults, children, services, accommodation_type,
                   activity_level, notes, estimated_price, reference, created_at
            FROM trips
            WHERE user_id = ?
            ORDER BY created_at DESC
        ');
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        // Desserializar services (JSON)
        foreach ($rows as &$row) {
            $row['services'] = json_decode($row['services'], true) ?? [];
        }

        echo json_encode(['success' => true, 'trips' => $rows]);
        exit;
    }

    // ── POST — criar planeamento ─────────────────────────────
    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body) json_error(400, 'Corpo inválido.');

        // Campos obrigatórios
        $userId        = (int)($body['user_id']          ?? 0);
        $destId        = (int)($body['destination_id']   ?? 0);
        $destName      = trim($body['destination_name']  ?? '');
        $dateFrom      = trim($body['date_from']          ?? '');
        $dateTo        = trim($body['date_to']            ?? '');
        $adults        = max(1, (int)($body['adults']    ?? 1));
        $children      = max(0, (int)($body['children']  ?? 0));

        // Campos opcionais
        $services          = json_encode(array_values((array)($body['services'] ?? [])));
        $accommodationType = trim($body['accommodation_type'] ?? '');
        $activityLevel     = trim($body['activity_level']     ?? 'moderado');
        $notes             = trim($body['notes']              ?? '');
        $estimatedPrice    = trim($body['estimated_price']    ?? '');

        // Validação
        $errors = [];
        if (!$userId)   $errors[] = 'user_id inválido.';
        if (!$destId)   $errors[] = 'destination_id inválido.';
        if (!$dateFrom) $errors[] = 'Data de partida é obrigatória.';
        if (!$dateTo)   $errors[] = 'Data de regresso é obrigatória.';
        if ($dateFrom && $dateTo && $dateTo <= $dateFrom)
            $errors[] = 'A data de regresso deve ser posterior à partida.';

        if ($errors) json_error(422, implode(' ', $errors));

        // Gerar código de referência único
        $reference = 'WL-' . strtoupper(substr(md5(uniqid('', true)), 0, 6));

        $stmt = $db->prepare('
            INSERT INTO trips
              (user_id, destination_id, destination_name, date_from, date_to,
               adults, children, services, accommodation_type, activity_level,
               notes, estimated_price, reference)
            VALUES
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $userId, $destId, $destName, $dateFrom, $dateTo,
            $adults, $children, $services, $accommodationType,
            $activityLevel, $notes, $estimatedPrice, $reference
        ]);

        http_response_code(201);
        echo json_encode([
            'success'   => true,
            'message'   => 'Viagem planeada com sucesso.',
            'reference' => $reference,
            'trip_id'   => (int)$db->lastInsertId(),
        ]);
        exit;
    }

    json_error(405, 'Método não permitido.');

} catch (PDOException $e) {
    json_error(500, 'Erro interno. Tente novamente.');
}

function json_error(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}
