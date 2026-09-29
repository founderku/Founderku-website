<?php
// Ekspor profil pengguna TukarSkill lama menjadi file SQL untuk tabel
// ss_legacy di Supabase Founderku (Social Space).
//
// Yang diambil HANYA data profil publik: email (untuk mencocokkan akun),
// nama, bio, kota, skill, dan tautan. Kata sandi, nomor HP, saldo, dan
// data lain TIDAK ikut. Akun admin dan akun yang disuspend dilewati.
//
// Cara pakai (di server TukarSkill, folder aplikasi Laravel):
//   php export-ss-legacy.php > ~/ss_legacy_import.sql
// Hasilnya berisi email pengguna: simpan pribadi, jangan dibagikan.

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

function q($s): string
{
    $s = (string) ($s ?? '');
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return "'" . str_replace("'", "''", trim($s)) . "'";
}

function skills($v): string
{
    $list = is_array($v) ? $v : (json_decode((string) $v, true) ?: []);
    $out = [];
    foreach ($list as $x) {
        if (is_string($x) && mb_strlen(trim($x)) >= 2) $out[] = q(mb_substr(trim($x), 0, 40));
        if (count($out) >= 10) break;
    }
    return $out ? 'array[' . implode(', ', $out) . ']::text[]' : "'{}'::text[]";
}

function link_https($v): string
{
    $s = trim((string) ($v ?? ''));
    if ($s === '') return "''";
    if (stripos($s, 'http://') === 0) $s = 'https://' . substr($s, 7);
    // Selain https biasa dikosongkan (database juga mengecek ulang saat klaim)
    return preg_match('#^https://[^\s"<>]{3,190}$#', $s) ? q($s) : "''";
}

$query = DB::table('users')->where('role', '!=', 'admin');
if (Schema::hasColumn('users', 'suspended_at')) $query->whereNull('suspended_at');

$seen = [];
$n = 0;
echo "-- Arsip profil TukarSkill untuk Social Space Founderku\n";
echo "-- Dibuat " . date('Y-m-d H:i') . ". Berisi email pengguna: simpan pribadi.\n";
echo "-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.\n";
echo "begin;\n";
foreach ($query->orderBy('id')->cursor() as $u) {
    $email = strtolower(trim((string) $u->email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 200 || isset($seen[$email])) continue;
    $seen[$email] = true;
    $city = trim((string) ($u->kota ?? ''));
    $joined = $u->created_at ? q(date('Y-m-d H:i:s', strtotime((string) $u->created_at)) . '+00') : 'null';
    echo "insert into public.ss_legacy (email, full_name, headline, bio, city, skills_offer, skills_want, website, instagram, linkedin, joined_at) values ("
        . implode(', ', [
            q($email),
            q(mb_substr((string) ($u->full_name ?? ''), 0, 100)),
            q(mb_substr((string) ($u->bio_short ?? ''), 0, 120)),
            q(mb_substr((string) ($u->about ?? ''), 0, 1000)),
            q(mb_substr($city, 0, 60)),
            skills($u->skills_owned ?? null),
            skills($u->skills_wanted ?? null),
            link_https($u->website ?? ''),
            link_https($u->instagram ?? ''),
            link_https($u->linkedin ?? ''),
            $joined,
        ])
        . ") on conflict (email) do nothing;\n";
    $n++;
}
echo "commit;\n";
echo "-- Jumlah profil: $n\n";
fwrite(STDERR, "Selesai: $n profil diekspor.\n");
