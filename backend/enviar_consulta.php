<?php
header('Content-Type: application/json');

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "farmacia_el_nayar";

// Conexión
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Conexión fallida: ' . $conn->connect_error]));
}

$maxFileSize = 10 * 1024 * 1024; // 10MB
if (isset($_FILES['adjunto']) && $_FILES['adjunto']['size'][0] > $maxFileSize) {
    die(json_encode(['success' => false, 'message' => 'El archivo excede el tamaño máximo permitido (10MB)']));
}

// Recoger datos del formulario
$telefono = $_POST['telefono'] ?? '';
$email = $_POST['email'] ?? null;
$asunto = $_POST['asunto'] ?? '';
$mensaje = $_POST['mensaje'] ?? '';
$idUsuario = 1; // En un sistema real, se obtendría de la sesión

// Manejo de archivo adjunto
$adjuntoUrl = null;
if (isset($_FILES['adjunto']) && $_FILES['adjunto']['error'][0] === UPLOAD_ERR_OK) {
    $targetDir = "../uploads/consultas/";
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    $fileName = uniqid() . '_' . basename($_FILES['adjunto']['name'][0]);
    $targetFile = $targetDir . $fileName;
    
    // Validar tipo de archivo
    $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    $fileType = $_FILES['adjunto']['type'][0];
    
    if (in_array($fileType, $allowedTypes)) {
        if (move_uploaded_file($_FILES['adjunto']['tmp_name'][0], $targetFile)) {
            $adjuntoUrl = $targetFile;
        }
    }
}

// Insertar en la base de datos
$stmt = $conn->prepare("INSERT INTO consultas (id_usuario, asunto, mensaje, adjunto_url, contact_phone, contact_email, estado) 
                        VALUES (?, ?, ?, ?, ?, ?, 'pendiente')");
$stmt->bind_param("isssss", $idUsuario, $asunto, $mensaje, $adjuntoUrl, $telefono, $email);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al guardar la consulta: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>