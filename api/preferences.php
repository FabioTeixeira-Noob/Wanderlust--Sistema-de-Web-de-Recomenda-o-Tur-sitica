<?php
// ============================================================
//  WANDERLUST — Preferências
//  GET  /api/preferences.php?user_id=1   → carregar preferências
//  POST /api/preferences.php             → guardar preferências
//
//  Body POST JSON: { user_id, categories[], budget, climate, distance }
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

    // ── GET — carregar preferências ──────────────────────────
    if ($method === 'GET') {
        $userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
        if (!$userId) json_error(400, 'user_id inválido.');

        $stmt = $db->prepare('SELECT categories, budget, climate, distance FROM preferences WHERE user_id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!$row) {
            echo json_encode(['success' => true, 'preferences' => null]);
            exit;
        }

        echo json_encode([
            'success'     => true,
            'preferences' => [
                'categories' => json_decode($row['categories'], true) ?? [],
                'budget'     => $row['budget'],
                'climate'    => $row['climate'],
                'distance'   => $row['distance'],
            ],
        ]);
        exit;
    }

    // ── POST — guardar preferências ──────────────────────────
    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body) json_error(400, 'Corpo inválido.');

        $userId     = (int)($body['user_id']    ?? 0);
        $categories = $body['categories']        ?? [];
        $budget     = $body['budget']            ?? 'médio';
        $climate    = $body['climate']           ?? 'tropical';
        $distance   = (int)($body['distance']   ?? 12);

        if (!$userId) json_error(400, 'user_id é obrigatório.');

        $categoriesJson = json_encode(array_values((array)$categories));

        // Inserir ou actualizar (UPSERT)
        $stmt = $db->prepare('
            INSERT INTO preferences (user_id, categories, budget, climate, distance)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                categories = VALUES(categories),
                budget     = VALUES(budget),
                climate    = VALUES(climate),
                distance   = VALUES(distance),
                updated_at = CURRENT_TIMESTAMP
        ');
        $stmt->execute([$userId, $categoriesJson, $budget, $climate, $distance]);

        echo json_encode(['success' => true, 'message' => 'Preferências guardadas.']);
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
