// Mock Data — Distributor Admin Dashboard, Universal Pensions Odisha
// Hierarchy: State (Odisha) → 30 Districts → 88 Branches → ~500 Agents → ~30,000 Subscribers

// ─── Seeded RNG for deterministic data ───────────────────────────────────────
let _seed = 42;
function rand() { _seed = (_seed * 16807 + 0) % 2147483647; return (_seed - 1) / 2147483646; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

// ─── Odia / Indian name pools ────────────────────────────────────────────────
const FIRST_NAMES_M = ['Aditya','Amit','Ananta','Arjun','Arun','Ashok','Bijay','Biswajit','Chandan','Deepak','Debashis','Dinesh','Gopal','Hari','Jagannath','Kartik','Kishore','Lalit','Manoj','Narayan','Nirmal','Pradeep','Prakash','Pravat','Rajesh','Ramesh','Ranjan','Sanjay','Santosh','Saroj','Sashi','Satyanarayan','Subhash','Sudhir','Sunil','Suresh','Tapan','Umesh'];
const FIRST_NAMES_F = ['Anita','Anusuya','Aparna','Arati','Archana','Bandana','Basanti','Bharati','Bhawani','Geeta','Jyoti','Kabita','Kalpana','Lata','Laxmi','Madhumita','Manjula','Manjusha','Meera','Minati','Nandini','Neelima','Padmini','Pratima','Priya','Puspa','Rashmita','Ritu','Sabita','Sangeeta','Saraswati','Shanti','Shibani','Sikha','Smita','Subhadra','Sujata','Sunita','Tulasi'];
const LAST_NAMES = ['Mohanty','Patnaik','Das','Sahu','Pradhan','Nayak','Parida','Behera','Swain','Jena','Mishra','Panda','Rath','Dash','Rout','Samal','Bhoi','Mallick','Kar','Khuntia','Tripathy','Acharya','Pattnaik','Samantaray','Hota','Bal','Padhi','Naik','Singh','Routray','Biswal','Sethi','Senapati','Pati','Kanungo','Mahapatra'];

function indianName(gender) {
  const first = gender === 'female' ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
  return `${first} ${pick(LAST_NAMES)}`;
}

// Indian mobile numbers: +91, 10 digits starting with 6/7/8/9
function indianPhone() {
  const firstDigit = pick(['6','7','8','9']);
  const rest = String(randInt(100000000, 999999999)).slice(0, 9);
  return `+91 ${firstDigit}${rest.slice(0,4)} ${rest.slice(4)}`;
}

// ─── Monthly contribution trend generator ────────────────────────────────────
function monthlyTrend(base, growth = 0.03, variance = 0.08) {
  const arr = [];
  let val = base;
  for (let i = 0; i < 12; i++) {
    val = Math.round(val * (1 + growth + (rand() - 0.5) * variance));
    arr.push(val);
  }
  return arr;
}

// ─── STATE (metrics aggregated from region after data generation) ────────────
// Top-level "country" entity represents the state of Odisha (id kept as 'country' level).
export const COUNTRY = {
  id: 'od',
  name: 'Odisha',
  center: [84.1355, 20.3107],
  metrics: null, // populated after rollup
};

// ─── REGIONS ─────────────────────────────────────────────────────────────────
// Odisha is modelled as a single region so that all districts roll up into the state.
// (The 5-level service/hook architecture is preserved; users never see a region step.)
export const REGIONS = {
  'r-odisha': { id: 'r-odisha', name: 'Odisha', parentId: 'od', center: [84.1355, 20.3107], metrics: null },
};

// ─── DISTRICTS ───────────────────────────────────────────────────────────────
// All 30 Odisha districts with real centroids computed from 2011 Census boundaries.
export const DISTRICTS = {
  'd-angul': { id: 'd-angul', name: 'Angul', parentId: 'r-odisha', center: [84.974, 21.1145], active: true },
  'd-balangir': { id: 'd-balangir', name: 'Balangir', parentId: 'r-odisha', center: [83.2087, 20.5725], active: true },
  'd-balasore': { id: 'd-balasore', name: 'Balasore', parentId: 'r-odisha', center: [86.9539, 21.5581], active: true },
  'd-bargarh': { id: 'd-bargarh', name: 'Bargarh', parentId: 'r-odisha', center: [83.2861, 21.1928], active: true },
  'd-bhadrak': { id: 'd-bhadrak', name: 'Bhadrak', parentId: 'r-odisha', center: [86.5544, 21.0171], active: true },
  'd-boudh': { id: 'd-boudh', name: 'Boudh', parentId: 'r-odisha', center: [84.1668, 20.5998], active: true },
  'd-cuttack': { id: 'd-cuttack', name: 'Cuttack', parentId: 'r-odisha', center: [85.8286, 20.4097], active: true },
  'd-deogarh': { id: 'd-deogarh', name: 'Deogarh', parentId: 'r-odisha', center: [84.7597, 21.4347], active: true },
  'd-dhenkanal': { id: 'd-dhenkanal', name: 'Dhenkanal', parentId: 'r-odisha', center: [85.5251, 20.8272], active: true },
  'd-gajapati': { id: 'd-gajapati', name: 'Gajapati', parentId: 'r-odisha', center: [84.1947, 19.1701], active: true },
  'd-ganjam': { id: 'd-ganjam', name: 'Ganjam', parentId: 'r-odisha', center: [84.5206, 19.5734], active: true },
  'd-jagatsinghpur': { id: 'd-jagatsinghpur', name: 'Jagatsinghpur', parentId: 'r-odisha', center: [86.3273, 20.2393], active: true },
  'd-jajpur': { id: 'd-jajpur', name: 'Jajpur', parentId: 'r-odisha', center: [86.1444, 20.8502], active: true },
  'd-jharsuguda': { id: 'd-jharsuguda', name: 'Jharsuguda', parentId: 'r-odisha', center: [83.9153, 21.8286], active: true },
  'd-kalahandi': { id: 'd-kalahandi', name: 'Kalahandi', parentId: 'r-odisha', center: [83.115, 19.7819], active: true },
  'd-kandhamal': { id: 'd-kandhamal', name: 'Kandhamal', parentId: 'r-odisha', center: [84.0597, 20.099], active: true },
  'd-kendrapara': { id: 'd-kendrapara', name: 'Kendrapara', parentId: 'r-odisha', center: [86.5703, 20.5494], active: true },
  'd-kendujhar': { id: 'd-kendujhar', name: 'Kendujhar', parentId: 'r-odisha', center: [85.7451, 21.495], active: true },
  'd-khordha': { id: 'd-khordha', name: 'Khordha', parentId: 'r-odisha', center: [85.531, 20.0981], active: true },
  'd-koraput': { id: 'd-koraput', name: 'Koraput', parentId: 'r-odisha', center: [82.805, 18.8289], active: true },
  'd-malkangiri': { id: 'd-malkangiri', name: 'Malkangiri', parentId: 'r-odisha', center: [81.9864, 18.2333], active: true },
  'd-mayurbhanj': { id: 'd-mayurbhanj', name: 'Mayurbhanj', parentId: 'r-odisha', center: [86.4275, 21.9151], active: true },
  'd-nabarangapur': { id: 'd-nabarangapur', name: 'Nabarangapur', parentId: 'r-odisha', center: [82.3991, 19.4645], active: true },
  'd-nayagarh': { id: 'd-nayagarh', name: 'Nayagarh', parentId: 'r-odisha', center: [85.0496, 20.1998], active: true },
  'd-nuapada': { id: 'd-nuapada', name: 'Nuapada', parentId: 'r-odisha', center: [82.6192, 20.4673], active: true },
  'd-puri': { id: 'd-puri', name: 'Puri', parentId: 'r-odisha', center: [85.7815, 19.997], active: true },
  'd-rayagada': { id: 'd-rayagada', name: 'Rayagada', parentId: 'r-odisha', center: [83.4532, 19.3019], active: true },
  'd-sambalpur': { id: 'd-sambalpur', name: 'Sambalpur', parentId: 'r-odisha', center: [84.3435, 21.528], active: true },
  'd-subarnapur': { id: 'd-subarnapur', name: 'Subarnapur', parentId: 'r-odisha', center: [83.8188, 20.888], active: true },
  'd-sundargarh': { id: 'd-sundargarh', name: 'Sundargarh', parentId: 'r-odisha', center: [84.4539, 22.0622], active: true },
};

// ─── BRANCHES ────────────────────────────────────────────────────────────────
// Branch distribution roughly weighted by urban hubs: Khordha (Bhubaneswar),
// Cuttack, Puri, Ganjam, Sundargarh, Balasore, Sambalpur get 4 branches each.
const BRANCH_DEFS = [
  { id: 'b-ang-001', name: 'Angul Central', districtId: 'd-angul', center: [85.0137, 21.1252] },
  { id: 'b-ang-002', name: 'Angul Town', districtId: 'd-angul', center: [84.9638, 21.0802] },
  { id: 'b-ang-003', name: 'Angul East', districtId: 'd-angul', center: [84.937, 21.0855] },
  { id: 'b-bal-004', name: 'Balangir Central', districtId: 'd-balangir', center: [83.2285, 20.5912] },
  { id: 'b-bal-005', name: 'Balangir Town', districtId: 'd-balangir', center: [83.2406, 20.6116] },
  { id: 'b-bal-006', name: 'Balangir East', districtId: 'd-balangir', center: [83.1807, 20.5747] },
  { id: 'b-bac-007', name: 'Balasore Central', districtId: 'd-balasore', center: [86.9292, 21.5202] },
  { id: 'b-bac-008', name: 'Soro', districtId: 'd-balasore', center: [86.9883, 21.5357] },
  { id: 'b-bac-009', name: 'Jaleswar', districtId: 'd-balasore', center: [86.9698, 21.584] },
  { id: 'b-bac-010', name: 'Basta', districtId: 'd-balasore', center: [86.9154, 21.5944] },
  { id: 'b-bar-011', name: 'Bargarh Central', districtId: 'd-bargarh', center: [83.2801, 21.1863] },
  { id: 'b-bar-012', name: 'Bargarh Town', districtId: 'd-bargarh', center: [83.3261, 21.153] },
  { id: 'b-bha-013', name: 'Bhadrak Central', districtId: 'd-bhadrak', center: [86.5501, 21.0023] },
  { id: 'b-bha-014', name: 'Bhadrak Town', districtId: 'd-bhadrak', center: [86.5155, 21.049] },
  { id: 'b-bha-015', name: 'Bhadrak East', districtId: 'd-bhadrak', center: [86.5688, 21.0489] },
  { id: 'b-bou-016', name: 'Boudh Central', districtId: 'd-boudh', center: [84.202, 20.585] },
  { id: 'b-bou-017', name: 'Boudh Town', districtId: 'd-boudh', center: [84.1434, 20.56] },
  { id: 'b-cut-018', name: 'Cuttack Central', districtId: 'd-cuttack', center: [85.7995, 20.4033] },
  { id: 'b-cut-019', name: 'Cuttack Bidanasi', districtId: 'd-cuttack', center: [85.8595, 20.446] },
  { id: 'b-cut-020', name: 'Choudwar', districtId: 'd-cuttack', center: [85.8498, 20.4356] },
  { id: 'b-cut-021', name: 'Cuttack Cantonment', districtId: 'd-cuttack', center: [85.7922, 20.3872] },
  { id: 'b-deo-022', name: 'Deogarh Central', districtId: 'd-deogarh', center: [84.7479, 21.3968] },
  { id: 'b-deo-023', name: 'Deogarh Town', districtId: 'd-deogarh', center: [84.7991, 21.4369] },
  { id: 'b-dhe-024', name: 'Dhenkanal Central', districtId: 'd-dhenkanal', center: [85.5267, 20.8663] },
  { id: 'b-dhe-025', name: 'Dhenkanal Town', districtId: 'd-dhenkanal', center: [85.4853, 20.8459] },
  { id: 'b-dhe-026', name: 'Dhenkanal East', districtId: 'd-dhenkanal', center: [85.5337, 20.7981] },
  { id: 'b-gaj-027', name: 'Gajapati Central', districtId: 'd-gajapati', center: [84.2323, 19.1358] },
  { id: 'b-gaj-028', name: 'Gajapati Town', districtId: 'd-gajapati', center: [84.1764, 19.1808] },
  { id: 'b-gan-029', name: 'Berhampur Central', districtId: 'd-ganjam', center: [84.4877, 19.6134] },
  { id: 'b-gan-030', name: 'Chatrapur', districtId: 'd-ganjam', center: [84.5474, 19.5841] },
  { id: 'b-gan-031', name: 'Aska', districtId: 'd-ganjam', center: [84.5466, 19.5391] },
  { id: 'b-gan-032', name: 'Hinjili', districtId: 'd-ganjam', center: [84.4871, 19.5444] },
  { id: 'b-jag-033', name: 'Jagatsinghpur Central', districtId: 'd-jagatsinghpur', center: [86.3099, 20.2581] },
  { id: 'b-jag-034', name: 'Jagatsinghpur Town', districtId: 'd-jagatsinghpur', center: [86.3653, 20.2784] },
  { id: 'b-jag-035', name: 'Jagatsinghpur East', districtId: 'd-jagatsinghpur', center: [86.3349, 20.2414] },
  { id: 'b-jaj-036', name: 'Jajpur Central', districtId: 'd-jajpur', center: [86.1045, 20.8123] },
  { id: 'b-jaj-037', name: 'Jajpur Town', districtId: 'd-jajpur', center: [86.1471, 20.8278] },
  { id: 'b-jaj-038', name: 'Jajpur East', districtId: 'd-jajpur', center: [86.1836, 20.8761] },
  { id: 'b-jha-039', name: 'Jharsuguda Central', districtId: 'd-jharsuguda', center: [83.9025, 21.8649] },
  { id: 'b-jha-040', name: 'Jharsuguda Town', districtId: 'd-jharsuguda', center: [83.8794, 21.8221] },
  { id: 'b-jha-041', name: 'Jharsuguda East', districtId: 'd-jharsuguda', center: [83.9374, 21.7888] },
  { id: 'b-kah-042', name: 'Kalahandi Central', districtId: 'd-kalahandi', center: [83.1452, 19.7671] },
  { id: 'b-kah-043', name: 'Kalahandi Town', districtId: 'd-kalahandi', center: [83.0851, 19.8138] },
  { id: 'b-kah-044', name: 'Kalahandi East', districtId: 'd-kalahandi', center: [83.0925, 19.8137] },
  { id: 'b-kan-045', name: 'Kandhamal Central', districtId: 'd-kandhamal', center: [84.0954, 20.0841] },
  { id: 'b-kan-046', name: 'Kandhamal Town', districtId: 'd-kandhamal', center: [84.073, 20.0592] },
  { id: 'b-kep-047', name: 'Kendrapara Central', districtId: 'd-kendrapara', center: [86.5312, 20.543] },
  { id: 'b-kep-048', name: 'Kendrapara Town', districtId: 'd-kendrapara', center: [86.567, 20.5857] },
  { id: 'b-kep-049', name: 'Kendrapara East', districtId: 'd-kendrapara', center: [86.6103, 20.5752] },
  { id: 'b-ken-050', name: 'Kendujhar Central', districtId: 'd-kendujhar', center: [85.7381, 21.4725] },
  { id: 'b-ken-051', name: 'Kendujhar Town', districtId: 'd-kendujhar', center: [85.707, 21.4571] },
  { id: 'b-ken-052', name: 'Kendujhar East', districtId: 'd-kendujhar', center: [85.762, 21.4972] },
  { id: 'b-kho-053', name: 'Bhubaneswar Central', districtId: 'd-khordha', center: [85.5648, 20.1372] },
  { id: 'b-kho-054', name: 'Bhubaneswar Saheed Nagar', districtId: 'd-khordha', center: [85.5054, 20.1168] },
  { id: 'b-kho-055', name: 'Bhubaneswar Chandrasekharpur', districtId: 'd-khordha', center: [85.5038, 20.069] },
  { id: 'b-kho-056', name: 'Khordha Town', districtId: 'd-khordha', center: [85.5636, 20.0639] },
  { id: 'b-kor-057', name: 'Koraput Central', districtId: 'd-koraput', center: [82.8238, 18.8397] },
  { id: 'b-kor-058', name: 'Koraput Town', districtId: 'd-koraput', center: [82.7676, 18.8689] },
  { id: 'b-kor-059', name: 'Koraput East', districtId: 'd-koraput', center: [82.7958, 18.8395] },
  { id: 'b-mal-060', name: 'Malkangiri Central', districtId: 'd-malkangiri', center: [82.0262, 18.199] },
  { id: 'b-mal-061', name: 'Malkangiri Town', districtId: 'd-malkangiri', center: [81.9853, 18.2043] },
  { id: 'b-may-062', name: 'Mayurbhanj Central', districtId: 'd-mayurbhanj', center: [86.388, 21.9339] },
  { id: 'b-may-063', name: 'Mayurbhanj Town', districtId: 'd-mayurbhanj', center: [86.4388, 21.9541] },
  { id: 'b-may-064', name: 'Mayurbhanj East', districtId: 'd-mayurbhanj', center: [86.4641, 21.9172] },
  { id: 'b-nab-065', name: 'Nabarangapur Central', districtId: 'd-nabarangapur', center: [82.3784, 19.4266] },
  { id: 'b-nab-066', name: 'Nabarangapur Town', districtId: 'd-nabarangapur', center: [82.3678, 19.4421] },
  { id: 'b-nab-067', name: 'Nabarangapur East', districtId: 'd-nabarangapur', center: [82.4279, 19.4905] },
  { id: 'b-nay-068', name: 'Nayagarh Central', districtId: 'd-nayagarh', center: [85.0735, 20.2361] },
  { id: 'b-nay-069', name: 'Nayagarh Town', districtId: 'd-nayagarh', center: [85.0147, 20.1932] },
  { id: 'b-nua-070', name: 'Nuapada Central', districtId: 'd-nuapada', center: [82.6043, 20.4275] },
  { id: 'b-nua-071', name: 'Nuapada Town', districtId: 'd-nuapada', center: [82.6579, 20.4526] },
  { id: 'b-pur-072', name: 'Puri Central', districtId: 'd-puri', center: [85.7864, 20.0289] },
  { id: 'b-pur-073', name: 'Puri Grand Road', districtId: 'd-puri', center: [85.7415, 20.0288] },
  { id: 'b-pur-074', name: 'Konark', districtId: 'd-puri', center: [85.7869, 19.9821] },
  { id: 'b-pur-075', name: 'Pipili', districtId: 'd-puri', center: [85.8201, 19.9572] },
  { id: 'b-ray-076', name: 'Rayagada Central', districtId: 'd-rayagada', center: [83.4378, 19.2955] },
  { id: 'b-ray-077', name: 'Rayagada Town', districtId: 'd-rayagada', center: [83.4186, 19.3382] },
  { id: 'b-ray-078', name: 'Rayagada East', districtId: 'd-rayagada', center: [83.4775, 19.3277] },
  { id: 'b-sam-079', name: 'Sambalpur Central', districtId: 'd-sambalpur', center: [84.3719, 21.5055] },
  { id: 'b-sam-080', name: 'Burla', districtId: 'd-sambalpur', center: [84.3119, 21.4901] },
  { id: 'b-sam-081', name: 'Hirakud', districtId: 'd-sambalpur', center: [84.3233, 21.5303] },
  { id: 'b-sam-082', name: 'Sambalpur Ainthapali', districtId: 'd-sambalpur', center: [84.3803, 21.5671] },
  { id: 'b-sub-083', name: 'Subarnapur Central', districtId: 'd-subarnapur', center: [83.8295, 20.9066] },
  { id: 'b-sub-084', name: 'Subarnapur Town', districtId: 'd-subarnapur', center: [83.7792, 20.8589] },
  { id: 'b-sun-085', name: 'Rourkela Central', districtId: 'd-sundargarh', center: [84.4534, 22.028] },
  { id: 'b-sun-086', name: 'Rourkela Civil Township', districtId: 'd-sundargarh', center: [84.4936, 22.073] },
  { id: 'b-sun-087', name: 'Sundargarh Town', districtId: 'd-sundargarh', center: [84.4442, 22.1022] },
  { id: 'b-sun-088', name: 'Bonai', districtId: 'd-sundargarh', center: [84.4167, 22.0728] },
];

export const BRANCHES = {};
BRANCH_DEFS.forEach((b) => {
  const mGender = rand() < 0.55 ? 'male' : 'female';
  const mName = indianName(mGender);
  BRANCHES[b.id] = {
    ...b,
    parentId: b.districtId,
    managerName: mName,
    managerPhone: indianPhone(),
    managerEmail: `${mName.toLowerCase().replace(/\s+/g, '.')}@upensions.in`,
    status: rand() < 0.9 ? 'active' : 'inactive',
    metrics: null,
  };
  delete BRANCHES[b.id].districtId;
});

// ─── AGENTS ──────────────────────────────────────────────────────────────────
export const AGENTS = {};
const AGENT_STATUSES = ['active', 'active', 'active', 'active', 'inactive']; // 80% active
let agentCounter = 0;

Object.keys(BRANCHES).forEach((branchId) => {
  const count = randInt(5, 8); // 5-8 agents per branch → ~500 total
  for (let i = 0; i < count; i++) {
    agentCounter++;
    const gender = rand() < 0.55 ? 'male' : 'female';
    const id = `a-${String(agentCounter).padStart(3, '0')}`;
    const branchCenter = BRANCHES[branchId].center;
    AGENTS[id] = {
      id,
      name: indianName(gender),
      gender,
      employeeId: `EMP-${String(agentCounter).padStart(4, '0')}`,
      parentId: branchId,
      center: [branchCenter[0] + (rand() - 0.5) * 0.02, branchCenter[1] + (rand() - 0.5) * 0.02],
      phone: indianPhone(),
      rating: Math.round((3 + rand() * 2) * 10) / 10, // 3.0 - 5.0
      performance: randInt(45, 100),
      status: pick(AGENT_STATUSES),
      metrics: null, // populated below
    };
  }
});

// ─── SUBSCRIBERS (generated lazily) ──────────────────────────────────────────
const PRODUCTS = ['SavePlus', 'PensionBasic', 'PensionPremium', 'EducationSaver', 'HealthCover'];
const KYC_STATUSES = ['complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'pending', 'pending', 'incomplete']; // ~70% complete
const EMAIL_DOMAINS = ['gmail.com', 'gmail.com', 'gmail.com', 'yahoo.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com'];

let _subscribersCache = null;

function generateSubscribers() {
  if (_subscribersCache) return _subscribersCache;
  const subs = {};
  const agentIds = Object.keys(AGENTS);
  const TARGET_SUBS = 30000;
  const subsPerAgent = Math.ceil(TARGET_SUBS / agentIds.length);
  let subCounter = 0;

  agentIds.forEach((agentId) => {
    const count = randInt(Math.max(5, subsPerAgent - 5), subsPerAgent + 5);
    for (let i = 0; i < count && subCounter < TARGET_SUBS; i++) {
      subCounter++;
      const gRoll = rand();
      const gender = gRoll < 0.55 ? 'male' : gRoll < 0.98 ? 'female' : 'other';
      const age = pick([
        randInt(18, 25), randInt(18, 25),
        randInt(26, 35), randInt(26, 35), randInt(26, 35), randInt(26, 35),
        randInt(36, 45), randInt(36, 45), randInt(36, 45),
        randInt(46, 55), randInt(46, 55),
        randInt(56, 70),
      ]);
      const isActive = rand() < (0.60 + rand() * 0.35);
      const monthlyAmt = randInt(5, 50) * 100; // ₹500 – ₹5,000 monthly contribution
      const contribHistory = monthlyTrend(monthlyAmt, isActive ? 0.02 : -0.05, 0.15);
      const totalC = contribHistory.reduce((s, v) => s + v, 0);
      const totalW = Math.round(totalC * (rand() * 0.15));
      const id = `s-${String(subCounter).padStart(4, '0')}`;
      const name = indianName(gender === 'other' ? (rand() < 0.5 ? 'male' : 'female') : gender);
      const numProducts = randInt(1, 3);
      const heldProducts = [];
      const used = new Set();
      for (let p = 0; p < numProducts; p++) {
        let prod = pick(PRODUCTS);
        while (used.has(prod)) prod = pick(PRODUCTS);
        used.add(prod);
        heldProducts.push(prod);
      }

      // Distribute registration dates: ~25% in 2024, ~45% in 2025, ~30% in 2026 (up to March)
      const yearRoll = rand();
      const regYear = yearRoll < 0.25 ? 2024 : yearRoll < 0.70 ? 2025 : 2026;
      const regMonth = regYear === 2026 ? randInt(1, 3) : randInt(1, 12);
      const regDay = randInt(1, 28);

      subs[id] = {
        id,
        name,
        email: `${name.toLowerCase().replace(/\s/g, '.')}${randInt(10, 999)}@${pick(EMAIL_DOMAINS)}`,
        phone: indianPhone(),
        gender,
        age,
        parentId: agentId,
        kycStatus: pick(KYC_STATUSES),
        isActive,
        contributionHistory: contribHistory,
        totalContributions: totalC,
        totalWithdrawals: totalW,
        registeredDate: `${regYear}-${String(regMonth).padStart(2, '0')}-${String(regDay).padStart(2, '0')}`,
        productsHeld: heldProducts,
      };
    }
  });
  _subscribersCache = subs;
  return subs;
}

// Proxy so SUBSCRIBERS behaves like a plain object but generates lazily
export const SUBSCRIBERS = new Proxy({}, {
  get(_, prop) {
    const data = generateSubscribers();
    if (prop === Symbol.iterator) return data[Symbol.iterator];
    return data[prop];
  },
  ownKeys() { return Object.keys(generateSubscribers()); },
  getOwnPropertyDescriptor(_, prop) {
    const data = generateSubscribers();
    if (prop in data) return { configurable: true, enumerable: true, value: data[prop] };
    return undefined;
  },
  has(_, prop) { return prop in generateSubscribers(); },
});

// ─── Aggregate metrics bottom-up ─────────────────────────────────────────────
function ageBucket(age) {
  if (age <= 25) return '18-25';
  if (age <= 35) return '26-35';
  if (age <= 45) return '36-45';
  if (age <= 55) return '46-55';
  return '56+';
}

function emptyMetrics() {
  return {
    totalSubscribers: 0,
    totalAgents: 0,
    totalContributions: 0,
    totalWithdrawals: 0,
    aum: 0,
    coverageRate: 0,
    activeRate: 0,
    activeSubscribers: 0,
    monthlyContributions: new Array(12).fill(0),
    genderRatio: { male: 0, female: 0, other: 0 },
    ageDistribution: { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 },
    newSubscribersToday: 0,
    prevNewSubscribersToday: 0,
    dailyContributions: 0,
    prevDailyContributions: 0,
    dailyWithdrawals: 0,
    prevDailyWithdrawals: 0,
    newSubscribersThisWeek: 0,
    prevNewSubscribersThisWeek: 0,
    weeklyContributions: 0,
    prevWeeklyContributions: 0,
    weeklyWithdrawals: 0,
    prevWeeklyWithdrawals: 0,
    newSubscribersThisMonth: 0,
    prevNewSubscribersThisMonth: 0,
    monthlyWithdrawals: 0,
    prevMonthlyWithdrawals: 0,
    kycPending: 0,
    kycIncomplete: 0,
  };
}

function addMetrics(target, source) {
  target.totalSubscribers += source.totalSubscribers;
  target.totalAgents += source.totalAgents;
  target.totalContributions += source.totalContributions;
  target.totalWithdrawals += source.totalWithdrawals;
  target.aum += source.aum;
  target.newSubscribersToday += source.newSubscribersToday;
  target.prevNewSubscribersToday += source.prevNewSubscribersToday;
  target.dailyContributions += source.dailyContributions;
  target.prevDailyContributions += source.prevDailyContributions;
  target.dailyWithdrawals += source.dailyWithdrawals;
  target.prevDailyWithdrawals += source.prevDailyWithdrawals;
  target.newSubscribersThisWeek += source.newSubscribersThisWeek;
  target.prevNewSubscribersThisWeek += source.prevNewSubscribersThisWeek;
  target.weeklyContributions += source.weeklyContributions;
  target.prevWeeklyContributions += source.prevWeeklyContributions;
  target.weeklyWithdrawals += source.weeklyWithdrawals;
  target.prevWeeklyWithdrawals += source.prevWeeklyWithdrawals;
  target.newSubscribersThisMonth += source.newSubscribersThisMonth;
  target.prevNewSubscribersThisMonth += source.prevNewSubscribersThisMonth;
  target.monthlyWithdrawals += source.monthlyWithdrawals;
  target.prevMonthlyWithdrawals += source.prevMonthlyWithdrawals;
  target.kycPending += source.kycPending;
  target.kycIncomplete += source.kycIncomplete;
  target._activeCount = (target._activeCount || 0) + Math.round(source.totalSubscribers * source.activeRate / 100);
  target._coverageWeighted = (target._coverageWeighted || 0) + source.coverageRate * source.totalSubscribers;
  for (let i = 0; i < 12; i++) target.monthlyContributions[i] += source.monthlyContributions[i];
  ['male', 'female', 'other'].forEach((g) => { target.genderRatio[g] += source.genderRatio[g]; });
  Object.keys(target.ageDistribution).forEach((k) => { target.ageDistribution[k] += source.ageDistribution[k]; });
}

function finalizeRates(m) {
  m.activeSubscribers = m._activeCount || 0;
  if (m.totalSubscribers > 0) {
    m.activeRate = Math.round(((m._activeCount || 0) / m.totalSubscribers) * 100);
    m.coverageRate = Math.round((m._coverageWeighted || 0) / m.totalSubscribers);
  }
  delete m._activeCount;
  delete m._coverageWeighted;
  const gTotal = m.genderRatio.male + m.genderRatio.female + m.genderRatio.other;
  if (gTotal > 0) {
    const malePct = Math.round((m.genderRatio.male / gTotal) * 100);
    const femalePct = Math.round((m.genderRatio.female / gTotal) * 100);
    m.genderRatio = { male: malePct, female: femalePct, other: 100 - malePct - femalePct };
  }
}

// Compute agent-level metrics from subscribers
const subs = generateSubscribers();
const subsByAgent = {};
Object.values(subs).forEach((s) => {
  if (!subsByAgent[s.parentId]) subsByAgent[s.parentId] = [];
  subsByAgent[s.parentId].push(s);
});
Object.values(AGENTS).forEach((agent) => {
  const m = emptyMetrics();
  const agentSubs = subsByAgent[agent.id] || [];
  m.totalSubscribers = agentSubs.length;
  m.totalAgents = 1;
  let activeCount = 0;
  agentSubs.forEach((s) => {
    m.totalContributions += s.totalContributions;
    m.totalWithdrawals += s.totalWithdrawals;
    if (s.isActive) activeCount++;
    if (s.kycStatus === 'pending') m.kycPending++;
    if (s.kycStatus === 'incomplete') m.kycIncomplete++;
    m.genderRatio[s.gender]++;
    m.ageDistribution[ageBucket(s.age)]++;
    s.contributionHistory.forEach((v, i) => { m.monthlyContributions[i] += v; });
  });
  m.activeRate = m.totalSubscribers ? Math.round((activeCount / m.totalSubscribers) * 100) : 0;
  m._activeCount = activeCount;
  m.aum = Math.round(m.totalContributions * (1.35 + rand() * 0.2));
  m.coverageRate = Math.min(95, Math.round(m.activeRate * 0.75 + randInt(5, 20)));
  m._coverageWeighted = m.coverageRate * m.totalSubscribers;
  m.newSubscribersThisMonth = randInt(Math.max(1, Math.floor(m.totalSubscribers * 0.03)), Math.max(2, Math.ceil(m.totalSubscribers * 0.08)));
  m.prevNewSubscribersThisMonth = Math.max(1, Math.round(m.newSubscribersThisMonth * (0.75 + rand() * 0.35)));
  m.monthlyWithdrawals = Math.round((m.totalWithdrawals / 12) * (0.8 + rand() * 0.4));
  m.prevMonthlyWithdrawals = Math.max(1, Math.round(m.monthlyWithdrawals * (0.85 + rand() * 0.3)));
  m.newSubscribersThisWeek = Math.max(1, Math.round(m.newSubscribersThisMonth / (3.5 + rand() * 1.5)));
  m.prevNewSubscribersThisWeek = Math.max(1, Math.round(m.newSubscribersThisWeek * (0.8 + rand() * 0.3)));
  m.weeklyContributions = Math.round((m.monthlyContributions[11] || 0) / (3.5 + rand() * 1.5));
  m.prevWeeklyContributions = Math.max(1, Math.round(m.weeklyContributions * (0.85 + rand() * 0.3)));
  m.weeklyWithdrawals = Math.round(m.monthlyWithdrawals / (3.5 + rand() * 1.5));
  m.prevWeeklyWithdrawals = Math.max(1, Math.round(m.weeklyWithdrawals * (0.85 + rand() * 0.3)));
  m.newSubscribersToday = Math.max(1, Math.round(m.newSubscribersThisWeek / (5 + rand() * 4)));
  m.prevNewSubscribersToday = Math.max(1, Math.round(m.newSubscribersToday * (0.7 + rand() * 0.5)));
  m.dailyContributions = Math.round(m.weeklyContributions / (5 + rand() * 4));
  m.prevDailyContributions = Math.max(1, Math.round(m.dailyContributions * (0.75 + rand() * 0.4)));
  m.dailyWithdrawals = Math.round(m.weeklyWithdrawals / (5 + rand() * 4));
  m.prevDailyWithdrawals = Math.max(1, Math.round(m.dailyWithdrawals * (0.75 + rand() * 0.4)));
  finalizeRates(m);
  agent.metrics = m;
  agent.performance = Math.min(100, Math.round(
    m.activeRate * 0.4 + Math.min(m.totalSubscribers / 20, 1) * 30 + randInt(15, 30)
  ));
  agent.rating = Math.min(5, Math.round((agent.performance / 22 + rand() * 0.4) * 10) / 10);
});

// Roll up: branch ← agents
Object.values(BRANCHES).forEach((branch) => {
  const m = emptyMetrics();
  Object.values(AGENTS).filter((a) => a.parentId === branch.id).forEach((a) => addMetrics(m, a.metrics));
  finalizeRates(m);
  branch.metrics = m;
});

// ─── BRANCH HEALTH SCORE + RANK ──────────────────────────────────────────────
function computeBranchScore(branch) {
  const m = branch.metrics;
  const totalSubs = m.totalSubscribers || 1;
  const retentionRate = (m.activeSubscribers / totalSubs) * 100;

  const agents = Object.values(AGENTS).filter(a => a.parentId === branch.id);
  const totalContrib = agents.reduce((s, a) => s + (a.metrics?.totalContributions || 0), 0);
  const avgPerSub = totalContrib / totalSubs;
  // Indian contribution scale: anchor at ₹50,000 cumulative per subscriber for a 100 score.
  const avgContribScore = Math.min(100, (avgPerSub / 50_000) * 100);

  const totalAgents = agents.length || 1;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const agentActivity = (activeAgents / totalAgents) * 100;

  const mc = m.monthlyContributions || [];
  let growthSum = 0, growthCount = 0;
  for (let i = 1; i < mc.length; i++) {
    if (mc[i - 1] > 0) { growthSum += ((mc[i] - mc[i - 1]) / mc[i - 1]) * 100; growthCount++; }
  }
  const avgGrowth = growthCount > 0 ? growthSum / growthCount : 0;
  const growthScore = Math.min(100, Math.max(0, (avgGrowth / 5) * 50 + 50));

  return Math.min(100, Math.max(0, Math.round(
    retentionRate * 0.30 + avgContribScore * 0.25 + agentActivity * 0.25 + growthScore * 0.20
  )));
}

Object.values(BRANCHES).forEach((branch) => {
  branch.score = computeBranchScore(branch);
});

const branchesByScore = Object.values(BRANCHES).sort((a, b) => b.score - a.score);
branchesByScore.forEach((branch, i) => { branch.rank = i + 1; });

const branchesByDistrict = {};
Object.values(BRANCHES).forEach((b) => {
  if (!branchesByDistrict[b.parentId]) branchesByDistrict[b.parentId] = [];
  branchesByDistrict[b.parentId].push(b);
});
Object.values(branchesByDistrict).forEach((arr) => {
  arr.sort((a, b) => b.score - a.score);
  arr.forEach((b, i) => { b.districtRank = i + 1; b.districtBranchCount = arr.length; });
});

// Roll up: district ← branches
Object.values(DISTRICTS).forEach((district) => {
  const m = emptyMetrics();
  const distBranches = Object.values(BRANCHES).filter((b) => b.parentId === district.id);
  distBranches.forEach((b) => addMetrics(m, b.metrics));
  m.totalBranches = distBranches.length;
  finalizeRates(m);
  district.metrics = m;
});

// Roll up: region ← districts
Object.values(REGIONS).forEach((region) => {
  const m = emptyMetrics();
  const regionDistricts = Object.values(DISTRICTS).filter((d) => d.parentId === region.id);
  regionDistricts.forEach((d) => addMetrics(m, d.metrics));
  m.totalBranches = regionDistricts.reduce((sum, d) => sum + (d.metrics?.totalBranches || 0), 0);
  finalizeRates(m);
  region.metrics = m;
});

// Roll up: state (country) ← regions
{
  const m = emptyMetrics();
  Object.values(REGIONS).forEach((r) => addMetrics(m, r.metrics));
  m.totalBranches = Object.keys(BRANCHES).length;
  finalizeRates(m);
  COUNTRY.metrics = m;
}

// ─── COMMISSIONS ────────────────────────────────────────────────────────────
// Commission rate — flat fee per subscriber who makes their first contribution.
export const COMMISSION_CONFIG = {
  ratePerSubscriber: 200, // ₹200 per subscriber (INR)
};

export const COMMISSIONS = {};
let commissionCounter = 0;

Object.values(AGENTS).forEach((agent) => {
  const agentSubs = subsByAgent[agent.id] || [];
  agentSubs.forEach((sub) => {
    if (sub.totalContributions <= 0) return;

    commissionCounter++;
    const id = `c-${String(commissionCounter).padStart(5, '0')}`;

    const regParts = sub.registeredDate.split('-').map(Number);
    const regDate = new Date(regParts[0], regParts[1] - 1, regParts[2]);
    const firstContribOffset = randInt(1, 30);
    const firstContribDate = new Date(regDate.getTime() + firstContribOffset * 86400000);
    const firstContribStr = `${firstContribDate.getFullYear()}-${String(firstContribDate.getMonth() + 1).padStart(2, '0')}-${String(firstContribDate.getDate()).padStart(2, '0')}`;

    const dueDate = new Date(firstContribDate.getTime() + 30 * 86400000);
    const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

    const now = new Date(2026, 3, 8);
    const statusRoll = rand();
    let status, paidDate = null, agentConfirmed = false;

    if (dueDate > now) {
      status = 'due';
    } else if (statusRoll < 0.65) {
      status = 'paid';
      const paidOffset = randInt(0, 14);
      const pd = new Date(dueDate.getTime() + paidOffset * 86400000);
      paidDate = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
      agentConfirmed = rand() < 0.85;
    } else if (statusRoll < 0.95) {
      status = 'due';
    } else {
      status = 'disputed';
    }

    const settlementRequested = status === 'due' && rand() < 0.25;

    const DISPUTE_REASONS = [
      'Subscriber denies onboarding',
      'Duplicate commission entry',
      'Incorrect commission amount',
      'Subscriber KYC incomplete',
      'Agent ID mismatch',
    ];
    const disputeReason = status === 'disputed' ? pick(DISPUTE_REASONS) : null;

    COMMISSIONS[id] = {
      id,
      agentId: agent.id,
      branchId: agent.parentId,
      subscriberId: sub.id,
      subscriberName: sub.name,
      amount: COMMISSION_CONFIG.ratePerSubscriber,
      status,
      firstContributionDate: firstContribStr,
      dueDate: dueDateStr,
      paidDate,
      agentConfirmed,
      settlementRequested,
      disputeReason,
    };
  });
});

export const commissionsByAgent = {};
Object.values(COMMISSIONS).forEach((c) => {
  if (!commissionsByAgent[c.agentId]) commissionsByAgent[c.agentId] = [];
  commissionsByAgent[c.agentId].push(c);
});

export const commissionsByBranch = {};
Object.values(COMMISSIONS).forEach((c) => {
  if (!commissionsByBranch[c.branchId]) commissionsByBranch[c.branchId] = [];
  commissionsByBranch[c.branchId].push(c);
});

// ─── LEVEL CONSTANTS & LOOKUP MAPS ───────────────────────────────────────────
export const LEVELS = { COUNTRY: 'country', REGION: 'region', DISTRICT: 'district', BRANCH: 'branch', AGENT: 'agent', SUBSCRIBER: 'subscriber' };

const LEVEL_MAP = {
  [LEVELS.COUNTRY]: { od: COUNTRY },
  [LEVELS.REGION]: REGIONS,
  [LEVELS.DISTRICT]: DISTRICTS,
  [LEVELS.BRANCH]: BRANCHES,
  [LEVELS.AGENT]: AGENTS,
  [LEVELS.SUBSCRIBER]: SUBSCRIBERS,
};

const CHILD_LEVEL = {
  [LEVELS.COUNTRY]: LEVELS.REGION,
  [LEVELS.REGION]: LEVELS.DISTRICT,
  [LEVELS.DISTRICT]: LEVELS.BRANCH,
  [LEVELS.BRANCH]: LEVELS.AGENT,
  [LEVELS.AGENT]: LEVELS.SUBSCRIBER,
};

// ─── Helper functions ────────────────────────────────────────────────────────

export function getChildEntities(level, parentId) {
  const childLevel = CHILD_LEVEL[level];
  if (!childLevel) return [];
  const map = LEVEL_MAP[childLevel];
  return Object.values(map).filter((e) => e.parentId === parentId);
}

export function getEntityById(level, id) {
  return LEVEL_MAP[level]?.[id] ?? null;
}

export function getBreadcrumbPath(currentLevel, selectedIds) {
  const crumbs = [{ level: LEVELS.COUNTRY, id: 'od', name: COUNTRY.name }];
  const order = [LEVELS.REGION, LEVELS.DISTRICT, LEVELS.BRANCH, LEVELS.AGENT, LEVELS.SUBSCRIBER];
  for (const lvl of order) {
    const id = selectedIds[lvl];
    if (!id) break;
    const entity = getEntityById(lvl, id);
    if (entity) crumbs.push({ level: lvl, id, name: entity.name });
    if (lvl === currentLevel) break;
  }
  return crumbs;
}

// formatINR is in src/utils/finance.js — single source of truth

export function getAllEntities(level) {
  return Object.values(LEVEL_MAP[level] || {});
}

export function getParentEntity(level, id) {
  const entity = getEntityById(level, id);
  if (!entity?.parentId) return null;
  const order = [LEVELS.COUNTRY, LEVELS.REGION, LEVELS.DISTRICT, LEVELS.BRANCH, LEVELS.AGENT];
  const idx = order.indexOf(level);
  return idx > 0 ? getEntityById(order[idx - 1], entity.parentId) : COUNTRY;
}

export function getTopBranch(level, parentId) {
  let branches = [];
  if (level === 'country') {
    branches = Object.values(BRANCHES);
  } else if (level === 'region') {
    const regionDistricts = Object.values(DISTRICTS).filter((d) => d.parentId === parentId);
    regionDistricts.forEach((d) => {
      branches.push(...Object.values(BRANCHES).filter((b) => b.parentId === d.id));
    });
  } else if (level === 'district') {
    branches = Object.values(BRANCHES).filter((b) => b.parentId === parentId);
  } else {
    return null;
  }
  if (branches.length === 0) return null;
  let top = branches[0];
  let topVal = top.metrics?.monthlyContributions?.[11] || 0;
  for (const b of branches) {
    const val = b.metrics?.monthlyContributions?.[11] || 0;
    if (val > topVal) { topVal = val; top = b; }
  }
  return { name: top.name, contribution: topVal };
}
