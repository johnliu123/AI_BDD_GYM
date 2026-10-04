# 檢查 RuleFile 是否符合 RuleFile-格式規範.md 中可機械判定的結構要求。
# 用法：powershell -NoProfile -File scripts/validate_rulefile.ps1 <RuleFile 路徑> [更多路徑...]
# 結束碼：0 表示沒有 ERROR，1 表示有 ERROR。WARN 不影響結束碼。

param(
    [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
    [string[]]$TargetPath
)

$enc = New-Object System.Text.UTF8Encoding($false)
$errorCount = 0
$warnCount = 0

function Write-Problem {
    param([string]$Severity, [string]$File, [int]$Line, [string]$Message)
    if ($Line -gt 0) { "{0} {1}:{2} {3}" -f $Severity, $File, $Line, $Message }
    else { "{0} {1} {2}" -f $Severity, $File, $Message }
}

foreach ($path in $TargetPath) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Write-Problem 'ERROR' $path 0 '檔案不存在'
        $errorCount++
        continue
    }

    $name = Split-Path -Leaf $path
    $text = [IO.File]::ReadAllText((Convert-Path -LiteralPath $path), $enc)
    $lines = $text -split "`r?`n"
    while ($lines.Count -gt 1 -and $lines[-1] -eq '') { $lines = $lines[0..($lines.Count - 2)] }

    if ($lines[0] -notmatch '^# Rule 1 - .+') {
        Write-Problem 'ERROR' $name 1 '第一行必須是 `# Rule 1 - <Rule name>`'
        $errorCount++
    }

    $fence = 0
    $rules = @()
    $current = $null

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $lineNo = $i + 1

        if ($line -match '^(`{3,})(.*)$') {
            $len = $Matches[1].Length
            $rest = $Matches[2]
            if ($fence -eq 0) { $fence = $len }
            elseif ($len -ge $fence -and $rest.Trim() -eq '') { $fence = 0 }
            continue
        }

        if ($fence -gt 0) { continue }

        if ($line -match '^#{2,} Rule \d+ - ') {
            Write-Problem 'ERROR' $name $lineNo '規則標題必須使用單一 `#`'
            $errorCount++
            continue
        }

        if ($line -match '^#(?!#)') {
            if ($line -notmatch '^# Rule (\d+) - (.+)$') {
                Write-Problem 'ERROR' $name $lineNo '標題不符合 `# Rule N - <Rule name>` 格式'
                $errorCount++
                continue
            }
            $current = [ordered]@{ Number = [int]$Matches[1]; Name = $Matches[2]; Line = $lineNo; Sections = @() }
            $rules += , $current

            $levelLine = $null
            for ($j = $i + 1; $j -lt $lines.Count; $j++) {
                if ($lines[$j].Trim() -ne '') { $levelLine = $lines[$j]; break }
            }
            if ($null -eq $levelLine -or $levelLine -notmatch '^- Level: `([^`]+)`$') {
                Write-Problem 'ERROR' $name $lineNo '標題後的第一個非空行必須是 `- Level: `<value>``'
                $errorCount++
            }
            elseif ($Matches[1] -notin @('MUST', 'SHOULD', 'MAY')) {
                Write-Problem 'ERROR' $name $lineNo ('Level 值 `{0}` 不是 MUST、SHOULD 或 MAY' -f $Matches[1])
                $errorCount++
            }
            continue
        }

        if ($line -match '^## ' -and $null -ne $current) {
            $current.Sections += $line
            $firstBody = $null
            for ($j = $i + 1; $j -lt $lines.Count; $j++) {
                if ($lines[$j].Trim() -ne '') { $firstBody = $lines[$j]; break }
            }
            if ($null -eq $firstBody -or $firstBody -notmatch '^- ') {
                Write-Problem 'WARN' $name $lineNo 'Example 區塊的第一個非空行應是 `- ` 條列說明'
                $warnCount++
            }
        }
    }

    if ($fence -ne 0) {
        Write-Problem 'ERROR' $name 0 'code fence 沒有成對關閉'
        $errorCount++
    }

    if ($rules.Count -eq 0) {
        Write-Problem 'ERROR' $name 0 '檔案內沒有任何 Rule'
        $errorCount++
    }

    for ($k = 0; $k -lt $rules.Count; $k++) {
        $rule = $rules[$k]
        if ($rule.Number -ne $k + 1) {
            Write-Problem 'ERROR' $name $rule.Line ('編號應為 {0}，實際為 {1}' -f ($k + 1), $rule.Number)
            $errorCount++
        }
        $joined = $rule.Sections -join '|'
        if ($joined -ne '## Good Example|## Bad Example') {
            $shown = if ($joined -eq '') { '（無）' } else { $joined }
            Write-Problem 'ERROR' $name $rule.Line ('Example 區塊必須依序為 Good、Bad 各一次，實際為 {0}' -f $shown)
            $errorCount++
        }
    }

    if ($rules.Count -gt 15) {
        Write-Problem 'WARN' $name 0 ('規則數量為 {0}，超過 15 條，請檢查是否混入第二個主題' -f $rules.Count)
        $warnCount++
    }

    '{0}: {1} rules' -f $name, $rules.Count
}

'ERROR {0} / WARN {1}' -f $errorCount, $warnCount
if ($errorCount -gt 0) { exit 1 } else { exit 0 }
