import { User, UpdateCategory } from '../types';

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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
    allowCamera: false,
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
  }
];
