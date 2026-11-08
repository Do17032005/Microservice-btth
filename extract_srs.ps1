Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "c:\Users\ADMIN\Desktop\hdxvgh\SRS_2_Ride_Hailing_Logistics.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlContent = $reader.ReadToEnd()
$stream.Close()
$zip.Dispose()

$xml = [xml]$xmlContent
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)
$lines = @()
foreach ($p in $paragraphs) {
    $t = ($p.SelectNodes(".//w:t", $ns) | ForEach-Object { $_.InnerText }) -join ""
    if ($t.Trim().Length -gt 0) {
        $lines += $t
    }
}
$lines -join "`r`n" | Out-File -FilePath "c:\Users\ADMIN\Desktop\hdxvgh\srs_extracted.txt" -Encoding utf8
Write-Output "Done. Paragraph count: $($lines.Count)"
