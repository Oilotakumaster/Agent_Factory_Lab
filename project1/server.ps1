$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://127.0.0.1:' + $port + '/')
$listener.Start()

Write-Host 'Aurora Local Server Port: 8080'
Start-Process 'http://127.0.0.1:8080/glass-auth/index.html'

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    
    $path = "d:\agent_factory\project1" + $req.Url.LocalPath.Replace('/', '\')
    if (Test-Path $path -PathType Container) {
        $path = Join-Path $path 'index.html'
    }
    
    if (Test-Path $path -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        if ($path -match '\.js$') { $res.ContentType = 'application/javascript' }
        elseif ($path -match '\.css$') { $res.ContentType = 'text/css' }
        elseif ($path -match '\.html$') { $res.ContentType = 'text/html; charset=utf-8' }
        elseif ($path -match '\.png$') { $res.ContentType = 'image/png' }
        elseif ($path -match '\.svg$') { $res.ContentType = 'image/svg+xml' }
        
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
    }
    $res.Close()
}
