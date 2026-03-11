<?php
// ============================================================
//  WANDERLUST — Destinos (CRUD completo)
//  GET    /api/destinations.php   → listar todos
//  POST   /api/destinations.php   → criar
//  PUT    /api/destinations.php   → editar
//  DELETE /api/destinations.php   → apagar
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDB();

    if ($method === 'GET') {
        $stmt = $db->query('SELECT * FROM destinations ORDER BY id ASC');
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['categories'] = json_decode($r['categories'], true) ?? [];
            $r['id']         = (int)$r['id'];
            $r['price_num']  = (int)$r['price_num'];
            $r['rating']     = (float)$r['rating'];
            $r['reviews']    = (int)$r['reviews'];
            $r['match']      = (int)$r['match_score'];
        }
        echo json_encode(['success' => true, 'destinations' => $rows]);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($method === 'POST') {
        $d = validate($body);
        $stmt = $db->prepare('
            INSERT INTO destinations
              (name, location, description, price, price_num, rating,
               reviews, climate, categories, image, badge, match_score)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        ');
        $stmt->execute([
            $d['name'],$d['location'],$d['description'],$d['price'],
            $d['price_num'],$d['rating'],$d['reviews'],$d['climate'],
            json_encode($d['categories']),$d['image'],$d['badge'],$d['match'],
        ]);
        http_response_code(201);
        echo json_encode(['success'=>true,'message'=>'Destino criado.','id'=>(int)$db->lastInsertId()]);
        exit;
    }

    if ($method === 'PUT') {
        $id = (int)($body['id'] ?? 0);
        if (!$id) json_error(400, 'id obrigatório.');
        $d = validate($body);
        $stmt = $db->prepare('
            UPDATE destinations SET name=?,location=?,description=?,price=?,price_num=?,
            rating=?,reviews=?,climate=?,categories=?,image=?,badge=?,match_score=? WHERE id=?
        ');
        $stmt->execute([
            $d['name'],$d['location'],$d['description'],$d['price'],
            $d['price_num'],$d['rating'],$d['reviews'],$d['climate'],
            json_encode($d['categories']),$d['image'],$d['badge'],$d['match'],$id,
        ]);
        echo json_encode(['success'=>true,'message'=>'Destino atualizado.']);
        exit;
    }

    if ($method === 'DELETE') {
        $id = (int)($body['id'] ?? 0);
        if (!$id) json_error(400, 'id obrigatório.');
        $db->prepare('DELETE FROM destinations WHERE id=?')->execute([$id]);
        echo json_encode(['success'=>true,'message'=>'Destino apagado.']);
        exit;
    }

    json_error(405, 'Método não permitido.');

} catch (PDOException $e) {
    json_error(500, 'Erro interno: ' . $e->getMessage());
}

function validate(array $b): array {
    $name  = trim($b['name']        ?? '');
    $loc   = trim($b['location']    ?? '');
    $desc  = trim($b['description'] ?? '');
    $price = trim($b['price']       ?? '');
    $img   = trim($b['image']       ?? '');
    if (!$name||!$loc||!$desc||!$price||!$img) json_error(422,'Nome, localização, descrição, preço e imagem são obrigatórios.');
    return [
        'name'=>$name,'location'=>$loc,'description'=>$desc,'price'=>$price,
        'price_num' => max(0,(int)($b['price_num']??0)),
        'rating'    => min(5,max(0,(float)($b['rating']??4.5))),
        'reviews'   => max(0,(int)($b['reviews']??0)),
        'climate'   => trim($b['climate']??''),
        'categories'=> array_values(array_filter((array)($b['categories']??[]))),
        'image'=>$img,
        'badge'     => trim($b['badge']??''),
        'match'     => min(100,max(0,(int)($b['match']??80))),
    ];
}

function json_error(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(['success'=>false,'message'=>$msg]);
    exit;
}
