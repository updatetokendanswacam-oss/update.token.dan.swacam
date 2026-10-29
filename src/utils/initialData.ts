import {
  User,
  UpdateCategory,
  TokenPackage,
  TokenBalance,
  TokenTransaction,
  SwacamConfig,
  SwacamLog,
  AppSettings,
  TokenSystemConfig
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-diki',
    name: 'Diki Solihin',
    email: 'updatetokendanswacam@gmail.com',
    role: 'admin',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Baru saja'
  },
  {
    id: 'user-saddam',
    name: 'Saddam',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Baru saja'
  },
  {
    id: 'user-kusnaedi',
    name: 'Kusnaedi',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: '5 mnt lalu'
  },
  {
    id: 'user-budiman',
    name: 'Budiman',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: false,
    lastSeen: '30 mnt lalu'
  },
  {
    id: 'user-muslim',
    name: 'Muslim',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Baru saja'
  },
  {
    id: 'user-agustian',
    name: 'Agustian',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: false,
    lastSeen: '1 jam lalu'
  },
  {
    id: 'user-junaedi',
    name: 'Junaedi',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Baru saja'
  },
  {
    id: 'user-samin',
    name: 'Samin',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: false,
    lastSeen: '2 jam lalu'
  },
  {
    id: 'user-randi',
    name: 'Randi',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Baru saja'
  },
  {
    id: 'user-roy',
    name: 'Roy',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Baru saja'
  },
  {
    id: 'user-romi',
    name: 'Romi',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: false,
    lastSeen: '3 jam lalu'
  },
  {
    id: 'user-kosasih',
    name: 'Kosasih',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Baru saja'
  },
  {
    id: 'user-nasrul',
    name: 'Nasrul',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: false,
    lastSeen: '4 jam lalu'
  },
  {
    id: 'user-said',
    name: 'Said',
    role: 'user',
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Baru saja'
  }
];

export const INITIAL_CATEGORIES: UpdateCategory[] = [
  {
    id: 'cat-token-manual',
    title: 'Pengisian Token Listrik Manual – DEPOTEL',
    period: 'Bulan Oktober 2026',
    type: 'token_manual',
    allowCamera: true,
    allowTokenInput: true,
    sites: [
      {
        id: 'm1',
        meterId: '541301045422',
        siteId: 'JTX376',
        siteName: 'KAYUPUTIHPACUANKUDAI4T',
        checked: false,
        tokens: [
          '0694-0057-9935-5566-9177',
          '4883-3281-0673-1088-7723',
          '4592-0662-1913-4727-4940'
        ],
        updatedAt: '2026-10-23T06:30:00.000Z',
        updatedBy: 'Petugas'
      },
      {
        id: 'm2',
        meterId: '544204129460',
        siteId: 'JTX269',
        siteName: 'MASJIDALKAUTSAR',
        checked: false,
        tokens: [
          '3414-4270-4674-4895-1323',
          '0855-3835-0869-4010-4460'
        ],
        updatedAt: '2026-10-23T06:35:00.000Z',
        updatedBy: 'Petugas'
      },
      {
        id: 'm3',
        meterId: '541300936924',
        siteId: 'JTX270',
        siteName: 'KEBEMBEMPULOGADUNG',
        checked: false,
        tokens: [
          '1662-9428-8705-0034-1303',
          '2707-7092-8863-8300-2428'
        ],
        updatedAt: '2026-10-23T06:40:00.000Z',
        updatedBy: 'Petugas'
      },
      {
        id: 'm4',
        meterId: '541300853217',
        siteId: 'JTX006',
        siteName: 'PERMANEN COMBAT CIPINANG BUNDER',
        checked: false,
        tokens: [
          '3115-6424-5771-5814-2746',
          '7351-7828-2974-3713-5630'
        ],
        updatedAt: '2026-10-23T06:45:00.000Z',
        updatedBy: 'Petugas'
      },
      {
        id: 'm5',
        meterId: '544203861556',
        siteId: 'JTX017',
        siteName: 'DRSUMARNO 2',
        checked: false,
        tokens: [
          '5105-3636-5375-1622-4356',
          '7098-1295-5676-4391-7297'
        ],
        updatedAt: '2026-10-23T06:50:00.000Z',
        updatedBy: 'Petugas'
      },
      {
        id: 'm6',
        meterId: '544204059954',
        siteId: 'JTX024',
        siteName: 'PENGGILINGAN ELOK',
        checked: false,
        tokens: [
          '3443-7752-5217-6499-9426',
          '4929-3442-8912-0354-8906'
        ],
        updatedAt: '2026-10-23T06:55:00.000Z',
        updatedBy: 'Petugas'
      }
    ]
  },
  {
    id: 'cat-swacam-depotel',
    title: 'Update Swacam/Catat Meter – DEPOTEL',
    period: '23–27 Oktober 2026',
    type: 'swacam',
    allowCamera: true,
    allowTokenInput: false,
    sites: [
      { id: 's1', meterId: '544203866651', siteId: 'JKT763', siteName: 'Pulogebangterminal-DMT', checked: false, tokens: [] },
      { id: 's2', meterId: '544204061540', siteId: 'JTX152', siteName: 'HAJIAHMADSTP', checked: false, tokens: [] },
      { id: 's3', meterId: '544204219515', siteId: 'JTX358', siteName: 'Jlrayapik-DMT', checked: false, tokens: [] },
      { id: 's4', meterId: '547104488429', siteId: 'JTX265', siteName: 'Taxiwayhalim-DMT', checked: false, tokens: [] },
      { id: 's5', meterId: '541300863386', siteId: 'JTX015', siteName: 'Puloutara8BTSH-TBG', checked: false, tokens: [] },
      { id: 's6', meterId: '543105050106', siteId: 'JKS413', siteName: 'Relocparadiso', checked: false, tokens: [] },
      { id: 's7', meterId: '543105233694', siteId: 'JSX442', siteName: 'JLBANKDAGANGNEGARATBG', checked: false, tokens: [] },
      { id: 's8', meterId: '543201116256', siteId: 'JKS256', siteName: 'Highscopecdk', checked: false, tokens: [] },
      { id: 's9', meterId: '547103987215', siteId: 'JKS724', siteName: 'Relocppplaza', checked: false, tokens: [] },
      { id: 's10', meterId: '547104349912', siteId: 'JTX058', siteName: 'MayjensutoyoBTSH-TBG', checked: false, tokens: [] },
      { id: 's11', meterId: '547202398420', siteId: 'JTX375', siteName: 'HbainkelapaduawetanBTSH-TBG', checked: false, tokens: [] },
      { id: 's12', meterId: '547400953635', siteId: 'JSX400', siteName: 'PegadenganpancoranBTSH-TBG', checked: false, tokens: [] },
      { id: 's13', meterId: '547401128114', siteId: 'JSX857', siteName: 'Cakramulia', checked: false, tokens: [] },
      { id: 's14', meterId: '547401196862', siteId: 'JSX907', siteName: 'WismapsmBTSH-TBG', checked: false, tokens: [] },
      { id: 's15', meterId: '547402281737', siteId: 'EPE220', siteName: 'JSX947_JLMUSHOLLACILANDAKTIMUR', checked: false, tokens: [] },
      { id: 's16', meterId: '547401307653', siteId: 'JSX876', siteName: 'RssiagarayaBTSH-IFT', checked: false, tokens: [] },
      { id: 's17', meterId: '541300600873', siteId: 'JKP959', siteName: 'FLYOVERCEMPAKAPUTIHNSTEL', checked: false, tokens: [] },
      { id: 's18', meterId: '544104200460', siteId: 'JKT565', siteName: 'Rsmitrajtngr-DMT', checked: false, tokens: [] },
      { id: 's19', meterId: '541302061234', siteId: 'EPE286', siteName: 'JATINEGARALIOOLEG-TBG', checked: false, tokens: [] },
      { id: 's20', meterId: '541302092830', siteId: 'JKT590', siteName: 'RAWAMANGUN MUKA RELOC', checked: false, tokens: [] },
      { id: 's21', meterId: '547202678218', siteId: 'JTX121', siteName: 'JLBAMBUHITAMIBS-MCP', checked: false, tokens: [] },
      { id: 's22', meterId: '547402386338', siteId: 'JSX867', siteName: 'GANDARIA5 JAGAKARSA', checked: false, tokens: [] },
    ]
  },
  {
    id: 'cat-token-depotel',
    title: 'Pengisian Token Listrik SWFM – DEPOTEL',
    period: 'Bulan Oktober 2026',
    type: 'token',
    allowCamera: true,
    allowTokenInput: true,
    sites: [
      { id: 't1', meterId: '547402150841', siteId: 'EPE134', siteName: 'EPE134_GGLANGGARKEBAGUSANEMRSSIAGARAYAEASYMACRO', checked: false, tokens: [] },
      { id: 't2', meterId: '547402159954', siteId: 'EPE133', siteName: 'EPE133_JLSIMANENORKEBAGUSANEMACRO', checked: false, tokens: [] },
      { id: 't3', meterId: '541300722052', siteId: 'COC143', siteName: 'COC143_CMBTCIPINANGBUNDER', checked: false, tokens: [] },
      { id: 't4', meterId: '544204835266', siteId: 'JKT640', siteName: 'JKT640_SMPNGPDKOPI', checked: false, tokens: [] },
      { id: 't5', meterId: '544104549801', siteId: 'EPE121', siteName: 'EPE121_KEBONPALAKPMELAYUEMACRO', checked: false, tokens: [] },
      { id: 't6', meterId: '547402151453', siteId: 'EPE118', siteName: 'EPE118_CIPEDAKDALAMSRENGSENGEMACRO', checked: false, tokens: [] },
      { id: 't7', meterId: '544104493058', siteId: 'EPE105', siteName: 'EPE105_JLKEBONPALA2EASYMACRO', checked: false, tokens: [] },
      { id: 't8', meterId: '547202531409', siteId: 'EPE123', siteName: 'EPE123_JLRAHAYU2KALISARIEMACRO', checked: false, tokens: [] },
      { id: 't9', meterId: '547402040765', siteId: 'EPE101', siteName: 'EPE101_BINCONDETEMACRO', checked: false, tokens: [] },
      { id: 't10', meterId: '547402176096', siteId: 'EPE141', siteName: 'EPE141_JLPEJATENBARAT2EMACRO', checked: false, tokens: [] },
      { id: 't11', meterId: '544205151195', siteId: 'EPE158', siteName: 'EPE158_JLMENTENGPURNAMACAKUNGEMACRO', checked: false, tokens: [] },
      { id: 't12', meterId: '547402134366', siteId: 'EPE127', siteName: 'EPE127_JLNUSAINDAHEMACRO', checked: false, tokens: [] },
      { id: 't13', meterId: '547402131207', siteId: 'EPE125', siteName: 'EPE125_JLHAJIICANGEMACRO', checked: false, tokens: [] },
      { id: 't14', meterId: '547104799792', siteId: 'EPE078', siteName: 'EPE078_BATUAMPAREMACROODMT', checked: false, tokens: [] },
      { id: 't15', meterId: '543602512320', siteId: 'EPE066', siteName: 'EPE066_PASARPONDOKLABUEMACRO', checked: false, tokens: [] },
      { id: 't16', meterId: '547104987172', siteId: 'EPE130', siteName: 'EPE130_KKPHALIMEMACRO', checked: false, tokens: [] },
      { id: 't17', meterId: '547104989288', siteId: 'EPE162', siteName: 'EPE162_JLKAMPUNGBARUHALIMEMACRO', checked: false, tokens: [] },
      { id: 't18', meterId: '547202522340', siteId: 'EPE135', siteName: 'EPE135_SMAN58EMACRO', checked: false, tokens: [] },
      { id: 't19', meterId: '544205132920', siteId: 'EPE153', siteName: 'EPE153_JLKAPUK3EMACRO', checked: false, tokens: [] },
      { id: 't20', meterId: '544104486916', siteId: 'EPE100', siteName: 'EPE100_GGCIPARAI10EMACRO', checked: false, tokens: [] },
      { id: 't21', meterId: '544205151888', siteId: 'EPE149', siteName: 'EPE149_JLLANGGARRAYAPDBAMBUEMACRO', checked: false, tokens: [] },
      { id: 't22', meterId: '544205145232', siteId: 'EPE119', siteName: 'EPE119_JLKELURAHANRAYADURENSAWITEMACRO', checked: false, tokens: [] },
      { id: 't23', meterId: '541301866778', siteId: 'EPE122', siteName: 'EPE122_JLPULONANGKAPULOGADUNGEMACRO', checked: false, tokens: [] },
      { id: 't24', meterId: '547202543826', siteId: 'EPE124', siteName: 'EPE124_GGHIDENGCILANGKAPEMACRO', checked: false, tokens: [] },
      { id: 't25', meterId: '547402134118', siteId: 'EPE156', siteName: 'EPE156_JLPAGUJATENPOINT13EMACRO', checked: false, tokens: [] },
      { id: 't26', meterId: '547104958661', siteId: 'EPE107', siteName: 'EPE107_JLBATUBULATEMACRO', checked: false, tokens: [] },
      { id: 't27', meterId: '547402145270', siteId: 'EPE132', siteName: 'EPE132_JLCIKOKOBRTEMACRO', checked: false, tokens: [] },
      { id: 't28', meterId: '547402097726', siteId: 'EPE104', siteName: 'EPE104_PANGADEGANPANCORANEMACRO', checked: false, tokens: [] },
      { id: 't29', meterId: '547401249697', siteId: 'JSX938', siteName: 'JSX938_PANGADEGANTIMUR3', checked: false, tokens: [] },
      { id: 't30', meterId: '543105914221', siteId: 'EPE108', siteName: 'EPE108_JLCIPETERAYAEMACRO', checked: false, tokens: [] },
      { id: 't31', meterId: '514485849567', siteId: 'EPE111', siteName: 'EPE111_DARULARQOMEASYMACRO-PTI', checked: false, tokens: [] },
    ]
  },
  {
    id: 'cat-neteco-unmon',
    title: 'List NETECO UNMON Eastern JABO',
    period: 'Hari SELASA Tgl. 14 oktober 2026',
    type: 'neteco_unmon',
    allowCamera: true,
    allowTokenInput: false,
    sites: [
      { id: 'n1', meterId: '', siteId: 'JKT781', siteName: 'JKT781-TanahKoja1TBG-MACRO', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n2', meterId: '', siteId: 'JKT727', siteName: 'JKT727_JLRayaTiparCakungDMT-MACRO (junet)', checked: true, checkedBy: 'junet', tokens: [] },
      { id: 'n3', meterId: '', siteId: 'JKT206', siteName: 'JKT206_KOMODOHALIM_MACRO ( perlu uang akses 100.000) Tgl. 14 10 2026', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n4', meterId: '', siteId: 'JKT650', siteName: 'JKT650_TELKOMJTNGRA_MACRO_IBC (dikki)', checked: true, checkedBy: 'dikki', tokens: [] },
      { id: 'n5', meterId: '', siteId: 'JTX201', siteName: 'JTX201M41_MallbassurarpctINDOOR 23-04-2026 rivan', checked: true, checkedBy: 'rivan', tokens: [] },
      { id: 'n6', meterId: '', siteId: 'JKT632', siteName: 'JKT632M41_Rajiman2 ( dikki )', checked: true, checkedBy: 'dikki', tokens: [] },
      { id: 'n7', meterId: '', siteId: 'JTX147', siteName: 'JTX147_SukurKlenderDMT-MACRO 20-04-2026', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n8', meterId: '', siteId: 'DPK395', siteName: 'DPK395_BatalyonKavaleri1TBG-MACRO 08-06-2026 Rivan', checked: true, checkedBy: 'Rivan', tokens: [] },
      { id: 'n9', meterId: '', siteId: 'JKT037', siteName: 'JKT037M41_Rajiman ( dikki )', checked: true, checkedBy: 'dikki', tokens: [] },
      { id: 'n10', meterId: '', siteId: 'JKT808', siteName: 'JKT808-PISANGANBARUUTARA-MCME TGL.16032026.', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n11', meterId: '', siteId: 'JKT648', siteName: 'JKT648-UNIVERSITASBOROBUDUR Tgl.10032026', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n12', meterId: '', siteId: 'JKT083', siteName: 'JKT083_MpuTantular buat janji akses dengan dmt dan Bm kampus..OK TGL.17042026.RIVAN TEAM', checked: true, checkedBy: 'RIVAN TEAM', tokens: [] },
      { id: 'n13', meterId: '', siteId: 'JTX539', siteName: 'JTX539_PermanenAsramaHaji_TBG_MACRO', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n14', meterId: '', siteId: 'JKT292', siteName: 'JKT292_PalmeriamDMT-MACRO ( SMU BROKEN )', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n15', meterId: '', siteId: 'JTX345', siteName: 'JTX345-MAKASARPINANGRANTIDMT-MACRO 24-04-2026 Rivan', checked: true, checkedBy: 'Rivan', tokens: [] },
      { id: 'n16', meterId: '', siteId: 'JKT802', siteName: 'JKT802_PedatiTimurDalamTBG-MACRO', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n17', meterId: '', siteId: 'JKT187', siteName: 'JKT187_CipinangPuloMJ-MACRO 20-04-2026', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n18', meterId: '', siteId: 'JKT806', siteName: 'JKT806_KramatMocokertoTBG-MACRO OK TGL.16042026..Team Fikri..', checked: true, checkedBy: 'Team Fikri', tokens: [] },
      { id: 'n19', meterId: '', siteId: 'JKT185', siteName: 'JKT185_TengahRayaSTP_Macro Tgl.10032026.', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n20', meterId: '', siteId: 'JKT152', siteName: 'JKT152_PONDOKKELAPATIMURTBG', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n21', meterId: '', siteId: 'JTX644', siteName: 'JTX644-ROROTANCAKUNGTIMUR-DMT-MACRO (dikki)', checked: true, checkedBy: 'dikki', tokens: [] },
      { id: 'n22', meterId: '', siteId: 'JKT072', siteName: 'JKT072_KELDUKUH_MACRO(Randi)', checked: true, checkedBy: 'Randi', tokens: [] },
      { id: 'n23', meterId: '', siteId: 'JKT146', siteName: 'JKT146_Jlmndlclltan (perlu spare kabel LAN panjang 50M lebih) 24-04-2026 rivan', checked: true, checkedBy: 'rivan', tokens: [] },
      { id: 'n24', meterId: '', siteId: 'JKT610', siteName: 'JKT610_LurahHutanKayu-MACRO (junet bareng PM) site.', checked: true, checkedBy: 'junet bareng PM', tokens: [] },
      { id: 'n25', meterId: '', siteId: 'JKT751', siteName: 'JKT751-MENTENGMETRODMT-MACRO  (SMU Broken) (diki)', checked: true, checkedBy: 'diki', tokens: [] },
      { id: 'n26', meterId: '', siteId: 'JTX093', siteName: 'JTX093_KlinikMunjul_MCME', checked: false, tokens: [] },
      { id: 'n27', meterId: '', siteId: 'JKS775', siteName: 'JKS775_ADHIYAKSARAYAPTEL_MACRO (muslim)', checked: true, checkedBy: 'muslim', tokens: [] },
      { id: 'n28', meterId: '', siteId: 'JSX939', siteName: 'JSX939_LentengAgungRaya', checked: false, tokens: [] },
      { id: 'n29', meterId: '', siteId: 'JKT724', siteName: 'JKT724_JlRayaPondokRangonTBG-MACRO', checked: false, tokens: [] },
      { id: 'n30', meterId: '', siteId: 'JKS320', siteName: 'JKS320_RatuPrabu1-MACRO IBC', checked: false, tokens: [] },
      { id: 'n31', meterId: '', siteId: 'JKT548', siteName: 'JKT548_CIRAKASRAYA-MACRO', checked: false, tokens: [] },
      { id: 'n32', meterId: '', siteId: 'JSX339', siteName: 'JSX339_LEBAKBULUSINDAH1GHN-MACRO', checked: false, tokens: [] },
      { id: 'n33', meterId: '', siteId: 'JKT310', siteName: 'JKT310_CibuburRayagik-MACRO', checked: false, tokens: [] },
      { id: 'n34', meterId: '', siteId: 'JKT549', siteName: 'JKT549_Kalisari2-MACRO', checked: false, tokens: [] },
      { id: 'n35', meterId: '', siteId: 'JTX168', siteName: 'JTX168_JLBeringinSTP-MACRO (Irfan 15-04-2026)', checked: true, checkedBy: 'Irfan', tokens: [] },
      { id: 'n36', meterId: '', siteId: 'JKT349', siteName: 'JKT349_JKT349-MasjidNurulBarokah-MCME', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n37', meterId: '', siteId: 'JTX178', siteName: 'JTX178_CipayungCijantungDMT-MACRO (agustian)', checked: true, checkedBy: 'agustian', tokens: [] },
      { id: 'n38', meterId: '', siteId: 'JKT323', siteName: 'JKT323_JalanMakmur_Macro Tgl.10032026.', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n39', meterId: '', siteId: 'JKS503', siteName: 'JKS503_SinarMutiara_MACRO', checked: false, tokens: [] },
      { id: 'n40', meterId: '', siteId: 'JKT184', siteName: 'JKT184_JAGORAWIKM11MTRL_MACRO', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n41', meterId: '', siteId: 'JKS734', siteName: 'JKS734_MSJDattaubah-MACRO', checked: false, tokens: [] },
      { id: 'n42', meterId: '', siteId: 'JKT671', siteName: 'JKT671_PTCentexSTP-MACRO', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n43', meterId: '', siteId: 'JKS680', siteName: 'JKS680_BungaMatahari_MACRO', checked: false, tokens: [] },
      { id: 'n44', meterId: '', siteId: 'JKS154', siteName: 'JKS154_GOLDENTRULY_MACRO', checked: false, tokens: [] },
      { id: 'n45', meterId: '', siteId: 'JKS949', siteName: 'JKS949_JKS949-JASULATBG-MACRO (BTS di LAS PERMANENT )', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n46', meterId: '', siteId: 'JKS633', siteName: 'JKS633_LRAHTNJNGBRT_MACRO (SMU Broken)', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n47', meterId: '', siteId: 'JSX082', siteName: 'JSX082-RanchoIndahTBG-MACRO (butuh Kabel Panjang)', checked: true, checkedBy: 'Petugas', tokens: [] },
      { id: 'n48', meterId: '', siteId: 'JKT002', siteName: 'JKT002 CPNGTIMUR Tgl.18/2/26.Dikki', checked: true, checkedBy: 'Dikki', tokens: [] },
    ]
  }
];

export const INITIAL_TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'pkg-20k',
    name: 'Paket Pemula (20k)',
    tokenAmount: 13.5,
    price: 20000,
    bonus: 0,
    description: 'Cocok untuk kebutuhan darurat site monitoring berdaya rendah.'
  },
  {
    id: 'pkg-50k',
    name: 'Paket Hemat (50k)',
    tokenAmount: 34.0,
    price: 50000,
    bonus: 1.5,
    description: 'Pilihan standar mingguan untuk site transmisi mikro.'
  },
  {
    id: 'pkg-100k',
    name: 'Paket Standar (100k)',
    tokenAmount: 69.5,
    price: 100000,
    popular: true,
    bonus: 3.5,
    description: 'Paling sering digunakan untuk operasional site bulanan DEPOTEL.'
  },
  {
    id: 'pkg-200k',
    name: 'Paket Prioritas (200k)',
    tokenAmount: 142.0,
    price: 20000,
    bonus: 8.0,
    description: 'Direkomendasikan untuk cluster site dengan beban daya tinggi.'
  },
  {
    id: 'pkg-500k',
    name: 'Paket Cluster (500k)',
    tokenAmount: 360.0,
    price: 500000,
    bonus: 25.0,
    description: 'Solusi hemat untuk pengisian massal multi-site telekomunikasi.'
  },
  {
    id: 'pkg-1000k',
    name: 'Paket Enterprise (1 Juta)',
    tokenAmount: 735.0,
    price: 1000000,
    bonus: 60.0,
    description: 'Kapasitas maksimal untuk cadangan daya site jangka panjang.'
  }
];

export const INITIAL_TOKEN_BALANCE: TokenBalance = {
  currentBalance: 428.5,
  totalUsed: 1245.8,
  lowThreshold: 50.0,
  unit: 'kWh',
  lastUpdated: new Date().toISOString()
};

export const INITIAL_TRANSACTIONS: TokenTransaction[] = [
  {
    id: 'trx-demo-001',
    referenceNumber: 'TRX-DPT-202610-8812',
    packageId: 'pkg-100k',
    packageName: 'Paket Standar (100k)',
    tokenAmount: 69.5,
    price: 100000,
    paymentMethod: 'QRIS Mandiri/BCA',
    paymentMethodCode: 'qris',
    status: 'success',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    verifiedAt: new Date(Date.now() - 3600000 * 4.9).toISOString(),
    createdBy: 'Diki Solihin',
    isDemo: true
  },
  {
    id: 'trx-demo-002',
    referenceNumber: 'TRX-DPT-202610-7429',
    packageId: 'pkg-200k',
    packageName: 'Paket Prioritas (200k)',
    tokenAmount: 142.0,
    price: 200000,
    paymentMethod: 'BCA Virtual Account',
    paymentMethodCode: 'bca_va',
    status: 'success',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    verifiedAt: new Date(Date.now() - 86400000 * 1.95).toISOString(),
    createdBy: 'Saddam',
    isDemo: true
  },
  {
    id: 'trx-demo-003',
    referenceNumber: 'TRX-DPT-202610-6190',
    packageId: 'pkg-50k',
    packageName: 'Paket Hemat (50k)',
    tokenAmount: 34.0,
    price: 50000,
    paymentMethod: 'Mandiri Virtual Account',
    paymentMethodCode: 'mandiri_va',
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    createdBy: 'Diki Solihin',
    isDemo: true
  }
];

export const INITIAL_SWACAM_CONFIG: SwacamConfig = {
  isConnected: true,
  connectionStatus: 'connected',
  apiUrl: 'https://api-gateway.pln.co.id/v1/swacam-meter',
  apiKeyMasked: 'pln_live_sec_••••••••9841',
  provider: 'PLN SWACAM Metering Gateway v2.4',
  syncIntervalMinutes: 30,
  lastSyncTime: new Date(Date.now() - 1200000).toISOString(),
  lastSyncStatus: 'success',
  totalReadings: 324,
  successRate: 98.4,
  autoSync: true,
  allowDisconnect: true
};

export const INITIAL_SWACAM_LOGS: SwacamLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    level: 'success',
    event: 'Auto-Sync Meter',
    message: 'Sinkronisasi 22 site KWh meter berhasil diverifikasi oleh server SWACAM.',
    siteId: 'EPE134'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    level: 'info',
    event: 'API Handshake',
    message: 'Koneksi ke gateway PLN SWACAM terverifikasi (Latency: 48ms).',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
    level: 'warning',
    event: 'Meter Timeout',
    message: 'ID Pelanggan 547402386338 (JSX867) membutuhkan re-check foto manual.',
    siteId: 'JSX867'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    level: 'success',
    event: 'Batch Upload Meter',
    message: 'Unggah berkas foto meter dan watermark GPS berhasil diterima.',
  }
];

export const INITIAL_APP_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'id',
  notifications: true,
  emailAlerts: true,
  soundAlerts: false,
  tokenLowWarning: true
};

export const INITIAL_TOKEN_CONFIG: TokenSystemConfig = {
  provider: 'PLN Prepaid Token Gateway API',
  endpointUrl: 'https://api-prepaid.pln.co.id/v2/tokens',
  apiKeyMasked: 'pln_live_token_••••••••7721',
  tokenVersion: 'KRN 2 (Key Revision Number 2 / 2024-2026)',
  autoBatchSize: 50,
  timeoutSeconds: 30,
  environment: 'demo',
  lastValidated: new Date(Date.now() - 3600000 * 2).toISOString(),
  isValidated: true
};

