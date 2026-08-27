<?php
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Get the raw POST data (JSON)
$rawData = file_get_contents('php://input');

// Validate JSON
$decoded = json_decode($rawData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
    exit;
}

// Recipient email address - Kept completely secure on server-side
$recipient = 'spiliftmedia@gmail.com';
$endpoint = 'https://formsubmit.co/ajax/' . $recipient;

// Forward the request to FormSubmit using cURL
if (function_exists('curl_init')) {
    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        http_response_code($httpCode);
        echo $response;
        exit;
    }
}

// Fallback to file_get_contents stream context if cURL is not available
$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\nAccept: application/json\r\n",
        'method'  => 'POST',
        'content' => $rawData,
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$response = @file_get_contents($endpoint, false, $context);

if ($response !== false) {
    // Extract HTTP status code from $http_response_header
    $status_line = isset($http_response_header[0]) ? $http_response_header[0] : '';
    preg_match('{HTTP\/\S*\s(\d+)}', $status_line, $match);
    $httpCode = isset($match[1]) ? intval($match[1]) : 200;
    
    http_response_code($httpCode);
    echo $response;
    exit;
}

// Final fallback: standard PHP mail (in case outbound HTTP is blocked)
$name = isset($decoded['Name']) ? strip_tags($decoded['Name']) : 'N/A';
$email = isset($decoded['Email']) ? filter_var($decoded['Email'], FILTER_VALIDATE_EMAIL) : '';
$phone = isset($decoded['Phone']) ? strip_tags($decoded['Phone']) : 'N/A';
$service = isset($decoded['Service']) ? strip_tags($decoded['Service']) : 'N/A';
$message = isset($decoded['Message']) ? strip_tags($decoded['Message']) : 'N/A';

if ($email) {
    $subject = 'New Lead from SPILIFT Web (Fallback)';
    $body = "Name: $name\nEmail: $email\nPhone: $phone\nService: $service\nMessage:\n$message";
    $headers = "From: webmaster@" . $_SERVER['HTTP_HOST'] . "\r\n";
    $headers .= "Reply-To: $email\r\n";
    
    if (@mail($recipient, $subject, $body, $headers)) {
        http_response_code(200);
        echo json_encode(['success' => 'true', 'message' => 'The form was submitted successfully (fallback mail).']);
        exit;
    }
}

// If all methods failed
http_response_code(500);
echo json_encode(['success' => 'false', 'message' => 'Failed to forward submission.']);
?>
