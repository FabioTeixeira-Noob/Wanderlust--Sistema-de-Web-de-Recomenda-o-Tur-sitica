<?php
// ============================================================
//  WANDERLUST — API Admin
//  GET  /api/admin.php?action=overview
//  GET  /api/admin.php?action=users
//  GET  /api/admin.php?action=trips
//  GET  /api/admin.php?action=favorites_stats
//  POST /api/admin.php?action=update_user
//  POST /api/admin.php?action=delete_user
//  POST /api/admin.php?action=delete_trip
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config.php';

// ── Verificar se é admin ──────────────────────────────────────
// Numa aplicação real usaria sessões PHP. Aqui validamos pelo
// user_id enviado no header ou query string.
// Para maior segurança, implemente sessões PHP (session_start()).
$action = $_GET['action'] ?? '';
$body   = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
}

try {
    $db = getDB();

    switch ($action) {

        // ── Visão geral ─────────────────────────────────────
        case 'overview':
            $stats = [];

            // Totais
            $stats['total_users'] = (int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn();
            $stats['total_trips'] = (int)$db->query('SELECT COUNT(*) FROM trips')->fetchColumn();
            $stats['total_favs']  = (int)$db->query('SELECT COUNT(*) FROM favorites')->fetchColumn();

            // Novos nos últimos 30 dias
            $stats['new_users'] = (int)$db->query(
                "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL 30 DAY"
            )->fetchColumn();

            // Últimos 5 utilizadores
            $recentUsers = $db->query(
                'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
            )->fetchAll();

            // Últimas 5 viagens
            $recentTrips = $db->query(
                'SELECT id, destination_name, reference, created_at FROM trips ORDER BY created_at DESC LIMIT 5'
            )->fetchAll();

            echo json_encode([
                'success'      => true,
                'stats'        => $stats,
                'recent_users' => $recentUsers,
                'recent_trips' => $recentTrips,
            ]);
            break;

        // ── Listar utilizadores ─────────────────────────────
        case 'users':
            $stmt = $db->query(
                'SELECT id, name, email, location, role, created_at FROM users ORDER BY created_at DESC'
            );
            $users = $stmt->fetchAll();
            echo json_encode(['success' => true, 'users' => $users]);
            break;

        // ── Listar viagens ──────────────────────────────────
        case 'trips':
            $stmt = $db->query('
                SELECT t.*, u.name AS user_name
                FROM trips t
                LEFT JOIN users u ON u.id = t.user_id
                ORDER BY t.created_at DESC
            ');
            $trips = $stmt->fetchAll();
            foreach ($trips as &$t) {
                $t['services'] = json_decode($t['services'], true) ?? [];
            }
            echo json_encode(['success' => true, 'trips' => $trips]);
            break;

        // ── Estatísticas de favoritos ───────────────────────
        case 'favorites_stats':
            $stmt = $db->query(
                'SELECT destination_id, COUNT(*) AS total
                 FROM favorites
                 GROUP BY destination_id
                 ORDER BY total DESC'
            );
            echo json_encode(['success' => true, 'stats' => $stmt->fetchAll()]);
            break;

        // ── Atualizar utilizador ────────────────────────────
        case 'update_user':
            $id       = (int)($body['id']       ?? 0);
            $name     = trim($body['name']       ?? '');
            $email    = trim($body['email']      ?? '');
            $location = trim($body['location']   ?? '');
            $role     = in_array($body['role'] ?? '', ['admin','user']) ? $body['role'] : 'user';

            if (!$id || !$name || !$email) json_error(422, 'Dados inválidos.');

            // Verificar email duplicado
            $dup = $db->prepare('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1');
            $dup->execute([$email, $id]);
            if ($dup->fetch()) json_error(409, 'Email já está em uso por outro utilizador.');

            $stmt = $db->prepare('UPDATE users SET name=?, email=?, location=?, role=? WHERE id=?');
            $stmt->execute([$name, $email, $location ?: null, $role, $id]);

            echo json_encode(['success' => true, 'message' => 'Utilizador atualizado.']);
            break;

        // ── Apagar utilizador ───────────────────────────────
        case 'delete_user':
            $id = (int)($body['id'] ?? 0);
            if (!$id) json_error(400, 'id inválido.');

            $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Utilizador apagado.']);
            break;

        // ── Apagar viagem ───────────────────────────────────
        case 'delete_trip':
            $id = (int)($body['id'] ?? 0);
            if (!$id) json_error(400, 'id inválido.');

            $stmt = $db->prepare('DELETE FROM trips WHERE id = ?');
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Viagem apagada.']);
            break;

        default:
            json_error(400, 'Acção desconhecida.');
    }

} catch (PDOException $e) {
    json_error(500, 'Erro interno: ' . $e->getMessage());
}

function json_error(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}
