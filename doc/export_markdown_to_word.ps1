param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

function Add-Paragraph {
  param(
    [Parameter(Mandatory = $true)]$Doc,
    [AllowEmptyString()][string]$Text,
    [int]$Bold = 0,
    [int]$Size = 11,
    [int]$SpaceAfter = 6,
    [int]$LeftIndent = 0,
    [string]$FontName = 'Times New Roman'
  )

  $paragraph = $Doc.Content.Paragraphs.Add()
  $paragraph.Range.Text = $Text
  $paragraph.Range.Font.Name = $FontName
  $paragraph.Range.Font.Size = $Size
  $paragraph.Range.Font.Bold = $Bold
  $paragraph.Format.SpaceAfter = $SpaceAfter
  $paragraph.Format.LeftIndent = $LeftIndent
  $paragraph.Range.InsertParagraphAfter() | Out-Null
}

$inputFull = (Resolve-Path $InputPath).Path
$outputFull = [System.IO.Path]::GetFullPath($OutputPath)
$lines = Get-Content -Path $inputFull

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Add()

try {
  $inCodeBlock = $false

  foreach ($line in $lines) {
    $trimmed = $line.Trim()

    if ($trimmed -match '^```') {
      $inCodeBlock = -not $inCodeBlock
      continue
    }

    if ($inCodeBlock) {
      Add-Paragraph -Doc $doc -Text $line -Size 10 -SpaceAfter 0 -FontName 'Consolas'
      continue
    }

    if ([string]::IsNullOrWhiteSpace($trimmed)) {
      Add-Paragraph -Doc $doc -Text '' -SpaceAfter 0
      continue
    }

    if ($trimmed.StartsWith('# ')) {
      Add-Paragraph -Doc $doc -Text $trimmed.Substring(2) -Bold 1 -Size 16 -SpaceAfter 10
      continue
    }

    if ($trimmed.StartsWith('## ')) {
      Add-Paragraph -Doc $doc -Text $trimmed.Substring(3) -Bold 1 -Size 14 -SpaceAfter 8
      continue
    }

    if ($trimmed.StartsWith('### ')) {
      Add-Paragraph -Doc $doc -Text $trimmed.Substring(4) -Bold 1 -Size 12 -SpaceAfter 6
      continue
    }

    if ($trimmed.StartsWith('- ')) {
      Add-Paragraph -Doc $doc -Text ('• ' + $trimmed.Substring(2)) -Size 11 -LeftIndent 18 -SpaceAfter 3
      continue
    }

    if ($trimmed.StartsWith('**') -and $trimmed.EndsWith('**')) {
      $text = $trimmed.Trim('*')
      Add-Paragraph -Doc $doc -Text $text -Bold 1 -Size 11 -SpaceAfter 4
      continue
    }

    Add-Paragraph -Doc $doc -Text $line -Size 11 -SpaceAfter 6
  }

  $doc.SaveAs2([ref]$outputFull, [ref]16)
  $doc.Saved = $true
}
finally {
  $doc.Close([ref]0)
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
