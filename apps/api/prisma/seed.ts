/**
 * PawSense — Initial Seed Script
 *
 * Run with:
 *   cd apps/api
 *   npx tsx prisma/seed.ts
 *
 * Or add to package.json:
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 * Then run: npx prisma db seed
 *
 * Data covers cats (primary) and dogs (common in a mixed-species clinic).
 * All clinical details have been reviewed for accuracy.
 */

import 'dotenv/config'
import { createRequire } from 'module'
import { PrismaPg } from '@prisma/adapter-pg'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─────────────────────────────────────────────────────────────────────────────
// SYMPTOMS
// ─────────────────────────────────────────────────────────────────────────────
const SYMPTOMS = [
  // ── Systemic ────────────────────────────────────────────────────────────────
  {
    name: 'Fever',
    description:
      'Elevated body temperature above the normal range (>39.2 °C / 102.5 °F in cats and dogs). Often indicates infection, inflammation, or immune activation.',
    affectedBodyAreas: ['Systemic'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Measure rectal temperature for accuracy. Sustained fever >40 °C requires urgent evaluation.',
  },
  {
    name: 'Lethargy',
    description:
      'Marked decrease in energy, activity, and responsiveness. The animal appears unusually tired, disinterested in surroundings, or reluctant to move.',
    affectedBodyAreas: ['Systemic', 'Neurological'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Distinguish from normal rest patterns. Persistent lethargy lasting >24 h warrants investigation.',
  },
  {
    name: 'Weight Loss',
    description:
      'Progressive, unintentional reduction in body weight not attributable to dietary restriction. Loss of >10 % body weight over weeks is clinically significant.',
    affectedBodyAreas: ['Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Track body condition score (BCS) at each visit. Assess muscle mass separately (muscle condition score).',
  },
  {
    name: 'Loss of Appetite',
    description:
      'Reduced or complete cessation of food intake (anorexia). May be partial (hyporexia) or total. A common non-specific sign of many illnesses.',
    affectedBodyAreas: ['Systemic', 'Digestive'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Total anorexia in cats for >24–48 h risks hepatic lipidosis. Monitor hydration alongside food intake.',
  },
  {
    name: 'Dehydration',
    description:
      'Insufficient body fluid levels, assessed by skin turgor (tent test), dry mucous membranes, and sunken eyes. Classified as mild (<5 %), moderate (5–8 %), or severe (>8 %).',
    affectedBodyAreas: ['Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'PCV/TP help quantify severity. Severe dehydration (>10 %) requires IV fluid resuscitation.',
  },
  {
    name: 'Pale Mucous Membranes',
    description:
      'Gums, conjunctiva, or inner pinna appear white, grey, or washed-out pink instead of healthy salmon-pink. Indicates reduced peripheral perfusion or anaemia.',
    affectedBodyAreas: ['Cardiovascular', 'Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Check CRT alongside MM colour. Pale MMs with prolonged CRT suggest shock or severe anaemia.',
  },
  {
    name: 'Jaundice (Icterus)',
    description:
      'Yellow discolouration of the sclera, mucous membranes, and skin caused by elevated bilirubin. Arises from pre-hepatic (haemolysis), hepatic (liver disease), or post-hepatic (biliary obstruction) causes.',
    affectedBodyAreas: ['Systemic', 'Digestive', 'Ocular'],
    commonality: 'RARE' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'Most visible in sclera and non-pigmented gums. Differentiate cause with bile acids, urinalysis, and imaging.',
  },
  {
    name: 'Lymphadenopathy',
    description:
      'Enlargement of one or more lymph nodes beyond normal size. Can be localised (regional infection) or generalised (systemic disease, neoplasia).',
    affectedBodyAreas: ['Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'FNA cytology is the first-line diagnostic. Firm, fixed, or ulcerated nodes raise concern for neoplasia.',
  },

  // ── Digestive ────────────────────────────────────────────────────────────────
  {
    name: 'Vomiting',
    description:
      'Active expulsion of gastric or intestinal contents through the mouth. Distinguish from regurgitation (passive, no abdominal effort). Frequency, content, and timing relative to meals are diagnostically important.',
    affectedBodyAreas: ['Digestive'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Haematemesis (blood in vomit) or projectile vomiting warrant urgent assessment. Check for foreign body ingestion.',
  },
  {
    name: 'Diarrhoea',
    description:
      'Increased frequency, fluidity, or volume of faecal output. Small-bowel diarrhoea involves large volumes with weight loss; large-bowel diarrhoea is frequent and small with mucus/straining.',
    affectedBodyAreas: ['Digestive'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Bloody diarrhoea (haematochezia) requires prompt evaluation. Record colour, consistency, frequency, and presence of blood/mucus.',
  },
  {
    name: 'Abdominal Pain',
    description:
      'Signs of discomfort localised to the abdomen: hunched posture, guarding, reluctance to jump, vocalisation on palpation, or prayer position. Ranges from mild (borborygmi) to severe (peritonitis).',
    affectedBodyAreas: ['Digestive'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Severe pain with a tense/rigid abdomen is a surgical emergency. Pancreatitis classically presents with cranial abdominal pain.',
  },
  {
    name: 'Constipation',
    description:
      'Infrequent, difficult, or painful defaecation with hard, dry faeces. Chronic constipation leading to colonic impaction (obstipation) may require manual evacuation.',
    affectedBodyAreas: ['Digestive'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Megacolon is an irreversible end-stage complication in cats. Dehydration and low fibre diets are common predisposing factors.',
  },
  {
    name: 'Increased Thirst (Polydipsia)',
    description:
      'Abnormally elevated water consumption, typically defined as >100 mL/kg/day in cats or >90 mL/kg/day in dogs. Often paired with polyuria.',
    affectedBodyAreas: ['Systemic', 'Urinary'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'PU/PD differential is broad: diabetes mellitus, CKD, hyperthyroidism, pyometra, hypercalcaemia, hepatic disease.',
  },
  {
    name: 'Abdominal Distension',
    description:
      'Visually or palpably enlarged abdomen. Causes include fluid (ascites, haemoabdomen), organ enlargement (hepatomegaly, splenomegaly), gas (bloat/GDV), or fat.',
    affectedBodyAreas: ['Digestive'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'GDV (gastric dilatation-volvulus) in dogs is a life-threatening emergency. Ascites warrants abdominocentesis and fluid analysis.',
  },

  // ── Respiratory ──────────────────────────────────────────────────────────────
  {
    name: 'Coughing',
    description:
      'Forceful expulsion of air from the lungs to clear secretions or irritants. Can be productive (moist) or non-productive (dry/hacking). Cardiac vs. respiratory origin must be differentiated.',
    affectedBodyAreas: ['Respiratory'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Night-time coughing is more common with cardiac disease. Goose-honk cough suggests tracheal collapse in small breeds.',
  },
  {
    name: 'Sneezing',
    description:
      'Sudden, forceful expulsion of air through the nasal passages. Frequent sneezing may indicate upper respiratory infection, nasal foreign body, polyps, or neoplasia.',
    affectedBodyAreas: ['Respiratory'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Reverse sneezing (paroxysmal nasopharyngeal inspiration) is common in dogs and usually benign. Unilateral epistaxis alongside sneezing raises concern for nasal mass.',
  },
  {
    name: 'Nasal Discharge',
    description:
      'Discharge from one or both nostrils. Character ranges from clear/serous (viral, mild irritation) to mucopurulent (bacterial infection) to bloody (trauma, neoplasia, coagulopathy).',
    affectedBodyAreas: ['Respiratory'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Unilateral discharge is more likely to be a local lesion (foreign body, tumour). Bilateral suggests systemic or infectious cause.',
  },
  {
    name: 'Dyspnoea (Difficulty Breathing)',
    description:
      'Laboured or distressed breathing evidenced by open-mouth breathing, extended neck, abducted elbows, paradoxical breathing, or cyanosis. A medical emergency.',
    affectedBodyAreas: ['Respiratory', 'Cardiovascular'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Minimise stress during initial assessment — cats in respiratory distress are at risk of sudden death. Oxygen supplementation is first priority.',
  },
  {
    name: 'Increased Respiratory Rate (Tachypnoea)',
    description:
      'Respiratory rate consistently above normal resting levels (>30 breaths/min in cats, >20 breaths/min in dogs at rest). May precede overt dyspnoea.',
    affectedBodyAreas: ['Respiratory'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Owners can monitor resting respiratory rate (RRR) at home as an early indicator of congestive heart failure decompensation.',
  },
  {
    name: 'Eye Discharge (Ocular Discharge)',
    description:
      'Secretions from one or both eyes. Clear/watery (epiphora) may be normal or indicate early infection or obstruction. Mucopurulent discharge suggests bacterial involvement.',
    affectedBodyAreas: ['Ocular'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'FHV-1 causes recurrent conjunctivitis in cats with mucopurulent discharge. Unilateral ocular discharge warrants careful ophthalmoscopy.',
  },

  // ── Urinary ──────────────────────────────────────────────────────────────────
  {
    name: 'Increased Urination (Polyuria)',
    description:
      'Production of abnormally large volumes of dilute urine. Commonly paired with polydipsia. Quantified by 24-hour urine collection or urine-specific gravity assessment.',
    affectedBodyAreas: ['Urinary'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'USG <1.030 in cats (or <1.025 in dogs) with concurrent clinical signs warrants investigation for CKD, diabetes, or endocrine disease.',
  },
  {
    name: 'Straining to Urinate (Stranguria/Dysuria)',
    description:
      'Visible effort when attempting to urinate, with small or absent urine production. Indicates lower urinary tract inflammation, urolithiasis, or urethral obstruction.',
    affectedBodyAreas: ['Urinary'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'A male cat straining with no urine output is a urethral obstruction emergency. Death can occur within 24–48 h without relief.',
  },
  {
    name: 'Haematuria (Blood in Urine)',
    description:
      'Presence of red blood cells in urine, producing pink, red, or brown discolouration. Can be gross (visible) or microscopic. Location (beginning, throughout, or end of stream) aids localisation.',
    affectedBodyAreas: ['Urinary'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Distinguish from pigmenturia (haemoglobin or myoglobin) via urine sediment. Recurrent haematuria in older cats warrants cytology for TCC.',
  },

  // ── Dermatological ───────────────────────────────────────────────────────────
  {
    name: 'Pruritus (Itching)',
    description:
      'Persistent scratching, biting, licking, or rubbing of the skin. Can be generalised or localised. Primary cause may be ectoparasites, allergy, infection, or psychogenic.',
    affectedBodyAreas: ['Skin & Coat'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Distribution pattern guides diagnosis: ear/face/feet in atopy; dorsal lumbosacral in flea allergy; ventral in food allergy.',
  },
  {
    name: 'Alopecia (Hair Loss)',
    description:
      'Partial or complete loss of hair in patches or diffusely. May be pruritic (self-induced) or non-pruritic (endocrine, follicular disorders). Pattern, symmetry, and associated signs direct workup.',
    affectedBodyAreas: ['Skin & Coat'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'Symmetrical non-pruritic alopecia suggests endocrine disease (hypothyroidism, hyperadrenocorticism). Pruritic alopecia suggests allergy or parasites.',
  },
  {
    name: 'Skin Lesions (Papules/Pustules/Crusts)',
    description:
      'Primary or secondary skin changes including papules (small raised bumps), pustules (pus-filled), crusts, erosions, or ulcers. Morphology and distribution guide diagnosis.',
    affectedBodyAreas: ['Skin & Coat'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'Collect pustule cytology before antibiotics. Miliary dermatitis in cats (multiple small crusted papules over the dorsal trunk) is a hypersensitivity reaction pattern.',
  },

  // ── Musculoskeletal ──────────────────────────────────────────────────────────
  {
    name: 'Lameness',
    description:
      'Abnormal gait or reluctance to bear weight on one or more limbs. Ranges from subtle shortened stride to complete non-weight-bearing. Acute vs chronic onset and thorough orthopaedic examination are essential.',
    affectedBodyAreas: ['Musculoskeletal'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Grade 1–5 lameness scale. Joint effusion, pain on manipulation, and crepitus are key findings. Radiography is first-line imaging.',
  },
  {
    name: 'Muscle Wasting (Cachexia/Sarcopaenia)',
    description:
      'Progressive loss of skeletal muscle mass, often disproportionate to overall body weight change. Common in chronic disease, cancer, cardiac cachexia, and renal disease.',
    affectedBodyAreas: ['Musculoskeletal', 'Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Muscle condition score (MCS 0–3) should be assessed at every visit. Temporal and epaxial muscle loss most visible on physical exam.',
  },

  // ── Neurological ─────────────────────────────────────────────────────────────
  {
    name: 'Seizures (Epilepsy)',
    description:
      'Episodes of uncontrolled electrical discharge in the brain manifesting as convulsions, tonic-clonic activity, paddling, salivation, loss of consciousness, or focal twitching. Post-ictal disorientation is common.',
    affectedBodyAreas: ['Neurological'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Status epilepticus (>5 min or ≥2 seizures without recovery) is an emergency. Thorough history including toxin exposure is vital.',
  },
  {
    name: 'Ataxia (Loss of Coordination)',
    description:
      'Incoordination and instability during movement. Cerebellar ataxia (swaying, intention tremor), vestibular ataxia (head tilt, falling, nystagmus), or proprioceptive (spinal) ataxia differ in presentation.',
    affectedBodyAreas: ['Neurological'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Acute-onset vestibular disease (head tilt, rolling, nystagmus) in older cats/dogs is often idiopathic and carries a good prognosis. Paradoxical vestibular disease causes falling towards the normal side.',
  },

  // ── Cardiovascular ───────────────────────────────────────────────────────────
  {
    name: 'Exercise Intolerance',
    description:
      'Rapid fatigue, dyspnoea, or collapse during mild-to-moderate physical activity. Indicates reduced cardiac output, respiratory compromise, anaemia, or neuromuscular disease.',
    affectedBodyAreas: ['Cardiovascular', 'Respiratory', 'Musculoskeletal'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Owner-reported history of slowing on walks or reluctance to exercise is often subtle. Compare to previous activity levels.',
  },
  {
    name: 'Syncope (Fainting)',
    description:
      'Brief, transient loss of consciousness and postural tone due to sudden reduction in cerebral blood flow. Differentiate from seizures by the absence of tonic-clonic activity and rapid full recovery.',
    affectedBodyAreas: ['Cardiovascular', 'Neurological'],
    commonality: 'RARE' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Cardiac syncope often occurs during/after exertion. Holter monitoring or event recorder may be needed. ECG is essential to rule out arrhythmias.',
  },

  // ── Ocular ───────────────────────────────────────────────────────────────────
  {
    name: 'Corneal Ulceration',
    description:
      'Defect in the corneal epithelium and/or stroma, presenting as ocular pain (blepharospasm, epiphora), photophobia, and fluorescein dye uptake on examination.',
    affectedBodyAreas: ['Ocular'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Deep (>50 % stromal) or melting (collagenolytic) ulcers require urgent referral. Never use topical corticosteroids with a corneal ulcer present.',
  },
  {
    name: 'Uveitis',
    description:
      'Inflammation of the uveal tract (iris, ciliary body, choroid). Presents with pain, photophobia, miosis, aqueous flare, hyphaema, or hypopyon.',
    affectedBodyAreas: ['Ocular'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'FIV, FeLV, FIP, and toxoplasmosis are important systemic causes of uveitis in cats. Chronic uveitis leads to secondary glaucoma or phthisis bulbi.',
  },

  // ── Oral ─────────────────────────────────────────────────────────────────────
  {
    name: 'Halitosis (Bad Breath)',
    description:
      'Abnormally foul odour emanating from the mouth. Most commonly caused by periodontal disease; can also indicate systemic disease (uraemic breath in CKD, sweet/fruity smell in DKA).',
    affectedBodyAreas: ['Oral'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Dental disease is the most common disease in cats and dogs >3 years. Uraemic breath has a distinctive ammonia-like odour.',
  },
  {
    name: 'Oral Ulcers/Stomatitis',
    description:
      'Erosions or ulcers of the oral mucosa, tongue, gums, or pharynx. Causes include calicivirus, renal disease, immune-mediated conditions, and contact ulceration from foreign material.',
    affectedBodyAreas: ['Oral'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Severe lymphocytic-plasmacytic stomatitis in cats is painful and debilitating; full mouth extraction is often curative.',
  },

  // ── Reproductive ─────────────────────────────────────────────────────────────
  {
    name: 'Vaginal Discharge',
    description:
      'Abnormal secretions from the vulva. Character (serous, mucopurulent, bloody, or haemorrhagic) and timing relative to oestrus cycle aid diagnosis. Rule out pyometra in entire females.',
    affectedBodyAreas: ['Reproductive'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'Open-cervix pyometra presents with copious purulent vaginal discharge; closed-cervix pyometra has no discharge but is more life-threatening.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// TREATMENTS
// ─────────────────────────────────────────────────────────────────────────────
const TREATMENTS = [
  {
    name: 'IV Fluid Resuscitation & Supportive Care',
    description:
      'Administration of intravenous crystalloid (e.g. lactated Ringer\'s solution or 0.9 % NaCl) to restore circulating fluid volume, correct electrolyte imbalances, and support tissue perfusion. The cornerstone of treatment for dehydration, shock, and many systemic illnesses.',
    contraindications: [
      'Congestive heart failure or cardiac disease (fluid overload risk — use with caution and reduced rates)',
      'Pulmonary oedema (unless specifically treating dehydration concurrently)',
      'Known hypersensitivity to the specific fluid component',
    ],
    vetNotes:
      'Catheter placement (cephalic, saphenous, or jugular). Calculate deficit: % dehydration × body weight (kg) × 10 = mL deficit. Add maintenance rate (50–60 mL/kg/day cats; 40–60 mL/kg/day dogs) and ongoing losses. Reassess hydration status and urine output regularly.',
    estimatedDuration: '12–72 hours (inpatient)',
    estimatedCost: '$150–$400 USD depending on duration',
    successRate: 90,
    steps: [
      {
        title: 'Place IV catheter',
        description: 'Clip, scrub, and place a peripheral IV catheter (22–20 G for cats, 20–18 G for dogs). Confirm patency with flush.',
        durationMinutes: 10,
      },
      {
        title: 'Calculate fluid requirement',
        description: 'Estimate % dehydration clinically. Calculate: deficit + daily maintenance + ongoing losses. Select appropriate crystalloid.',
        durationMinutes: 5,
      },
      {
        title: 'Initiate fluid infusion',
        description: 'Connect fluid line and set rate on infusion pump. For shock: bolus 10–20 mL/kg over 15–20 min, then reassess.',
        durationMinutes: 20,
      },
      {
        title: 'Monitor patient',
        description: 'Check vital signs (HR, RR, MM colour, CRT, temp) every 1–4 h. Monitor urine output and body weight. Adjust fluid rate as needed.',
        durationMinutes: 60,
      },
      {
        title: 'Taper and transition to oral fluids',
        description: 'Once hydration is restored and patient is eating/drinking, reduce IV rate and transition to oral water and food intake.',
        durationMinutes: 30,
      },
    ],
  },
  {
    name: 'Antibiotic Therapy (Systemic)',
    description:
      'Systemic antimicrobial treatment for confirmed or suspected bacterial infections. Antibiotic selection should ideally be guided by culture and sensitivity results; empirical therapy uses spectrum-appropriate broad-coverage agents. Duration varies by infection site and severity.',
    contraindications: [
      'Known allergy or previous adverse reaction to the specific antibiotic class',
      'Renal or hepatic impairment requiring dose adjustment (not an absolute contraindication but requires modification)',
      'Fluoroquinolones in growing animals (cartilage toxicity risk)',
      'Tetracyclines in pregnant or nursing animals',
    ],
    vetNotes:
      'Culture and sensitivity testing is strongly recommended before initiating antibiotics where possible. Avoid unnecessary broad-spectrum antibiotics to minimise antimicrobial resistance. Complete full course even if clinical signs resolve early.',
    estimatedDuration: '7–28 days depending on infection type',
    estimatedCost: '$30–$150 USD for outpatient course',
    successRate: 85,
    steps: [
      {
        title: 'Confirm bacterial infection and perform culture',
        description: 'Collect appropriate sample (swab, urine, blood) for culture and sensitivity before starting antibiotics where feasible.',
        durationMinutes: 15,
      },
      {
        title: 'Select antibiotic',
        description: 'Choose empirical antibiotic based on most likely pathogen, site of infection, and patient signalment. Common first-line: amoxicillin-clavulanate, doxycycline, or trimethoprim-sulfa.',
        durationMinutes: 5,
      },
      {
        title: 'Administer and educate owner',
        description: 'Dispense oral medication. Demonstrate administration technique. Emphasise completing the full course and returning if signs worsen.',
        durationMinutes: 10,
      },
      {
        title: 'Re-examine and culture follow-up',
        description: 'Schedule recheck at 7–14 days. Review culture results and adjust antibiotic if resistance is identified.',
        durationMinutes: 20,
      },
    ],
  },
  {
    name: 'Antiviral & Supportive Therapy for Upper Respiratory Infection',
    description:
      'Multimodal management of feline or canine upper respiratory tract infections (URTIs). Includes antiviral agents (where applicable), nutritional support, nebulisation, and management of secondary bacterial infections. Aimed at reducing duration and severity of illness.',
    contraindications: [
      'Famciclovir: use with caution in cats with severe renal impairment (dose reduction required)',
      'Live attenuated vaccines should not be given to immunocompromised individuals',
    ],
    vetNotes:
      'Famciclovir (62.5 mg per cat BID-TID) is the antiviral of choice for FHV-1 in cats. L-lysine supplementation efficacy is debated — current evidence is mixed. Keep patients in warm, low-stress environments. Encourage eating by warming food.',
    estimatedDuration: '10–21 days',
    estimatedCost: '$80–$250 USD',
    successRate: 82,
    steps: [
      {
        title: 'Assess severity and isolate',
        description: 'Evaluate respiratory effort, hydration, and appetite. Isolate patient from other animals to prevent spread of contagious respiratory pathogens.',
        durationMinutes: 15,
      },
      {
        title: 'Initiate supportive care',
        description: 'Provide nutritional support (appetite stimulants or syringe feeding if anorectic), fluid therapy for dehydration, and maintain warmth.',
        durationMinutes: 20,
      },
      {
        title: 'Antiviral therapy (FHV-1 cats)',
        description: 'Administer famciclovir orally. Apply ophthalmic antivirals (cidofovir 0.5 % drops BID) if ocular herpesvirus signs present.',
        durationMinutes: 5,
      },
      {
        title: 'Nebulisation therapy',
        description: 'Saline nebulisation for 15–20 min BID to TID helps loosen nasal secretions. Follow with gentle nasal cleaning.',
        durationMinutes: 20,
      },
      {
        title: 'Antibiotic therapy for secondary infection',
        description: 'Initiate doxycycline or amoxicillin-clavulanate if mucopurulent discharge or systemic signs suggest secondary bacterial infection.',
        durationMinutes: 10,
      },
    ],
  },
  {
    name: 'Antiparasitic Treatment (Ectoparasites & Endoparasites)',
    description:
      'Pharmacological elimination of internal (worms, protozoa) and external (fleas, ticks, mites) parasites. Combination products are commonly used for broad-spectrum coverage. Environmental decontamination is essential for ectoparasite control.',
    contraindications: [
      'Ivermectin / milbemycin oxime: contraindicated in MDR1/ABCB1 mutation-positive breeds (Collies, Australian Shepherds, and related breeds) at high doses',
      'Spinosad: avoid concurrent use with ivermectin (neurological toxicity risk)',
      'Imidacloprid/permethrin spot-ons: NEVER apply permethrin-containing products to cats — lethal toxicity',
      'Fenbendazole: avoid in first trimester of pregnancy',
    ],
    vetNotes:
      'Treat all in-contact animals simultaneously. For flea infestations, >95 % of the flea lifecycle is in the environment — treat premises with an IGR (insect growth regulator). Rotate product classes to minimise resistance. Repeat faecal floatation 2–4 weeks post-treatment to confirm efficacy.',
    estimatedDuration: '1–7 days (acute); monthly prevention ongoing',
    estimatedCost: '$25–$100 USD per treatment',
    successRate: 95,
    steps: [
      {
        title: 'Identify parasite(s)',
        description: 'Perform physical examination (coat combing, skin scraping, ear cytology), faecal float/direct smear, and Baermann technique as indicated.',
        durationMinutes: 20,
      },
      {
        title: 'Select appropriate antiparasitic agent',
        description: 'Choose product based on parasite type, species, breed genetic risk (MDR1), age, weight, and pregnancy status.',
        durationMinutes: 5,
      },
      {
        title: 'Administer treatment',
        description: 'Apply topical or administer oral product per manufacturer guidelines. Confirm correct dosing by weight.',
        durationMinutes: 5,
      },
      {
        title: 'Environmental treatment (for ectoparasites)',
        description: 'Advise thorough vacuuming, laundering of bedding, and application of home premise spray with IGR to break the flea lifecycle.',
        durationMinutes: 10,
      },
      {
        title: 'Confirm efficacy and establish prevention',
        description: 'Recheck faecal sample or repeat skin examination in 2–4 weeks. Establish monthly preventive programme.',
        durationMinutes: 15,
      },
    ],
  },
  {
    name: 'Surgical Management of Urethral Obstruction (Cats)',
    description:
      'Emergency procedure to relieve blocked urethral outflow in male cats. Includes urethral catheterisation or perineal urethrostomy for recurrent/refractory cases. Followed by post-operative medical management and dietary modification.',
    contraindications: [
      'Severely compromised cardiovascular status must be stabilised before anaesthesia',
      'Severe hyperkalaemia (>7.5 mEq/L) should be medically managed before anaesthetic induction',
      'Perineal urethrostomy is contraindicated in cats with active urinary tract infection until infection is controlled',
    ],
    vetNotes:
      'Critical pre-anaesthetic stabilisation: ECG monitoring (hyperkalaemia causes bradycardia, widened QRS, peaked T waves), IV fluid therapy, and correction of electrolyte abnormalities. Post-obstruction diuresis is common — monitor fluid balance closely.',
    estimatedDuration: '2–5 days (hospitalisation)',
    estimatedCost: '$800–$2,500 USD',
    successRate: 88,
    steps: [
      {
        title: 'Emergency stabilisation',
        description: 'Place IV catheter, initiate fluid therapy. Obtain blood (PCV/TP, BUN, creatinine, electrolytes). ECG for cardiac arrhythmias secondary to hyperkalaemia.',
        durationMinutes: 30,
      },
      {
        title: 'Correct hyperkalaemia',
        description: 'If K+ >6.5 mEq/L or ECG changes: IV calcium gluconate (cardiac membrane stabilisation), dextrose +/- insulin, or sodium bicarbonate as indicated.',
        durationMinutes: 30,
      },
      {
        title: 'Urethral catheterisation',
        description: 'Under sedation or anaesthesia, place a lubricated urinary catheter (3.5 Fr tom cat catheter). Gently flush retrograde with sterile saline. Secure catheter in place.',
        durationMinutes: 30,
      },
      {
        title: 'Post-obstruction care',
        description: 'Maintain closed urinary collection system. Monitor urine output, fluid balance, and electrolytes q4–8h. Continue IV fluids for 24–48 h.',
        durationMinutes: 120,
      },
      {
        title: 'Dietary and medical management',
        description: 'Transition to urinary prescription diet (reduced magnesium, controlled mineral content, encourages water intake). Discuss environmental enrichment and stress reduction. Schedule recheck urinalysis.',
        durationMinutes: 20,
      },
    ],
  },
  {
    name: 'Chemotherapy Protocol (CHOP-Based Lymphoma)',
    description:
      'Combination chemotherapy protocol for treatment of multicentric lymphoma, the most common haematopoietic malignancy in dogs. CHOP protocol includes Cyclophosphamide, Hydroxydaunorubicin (doxorubicin), Vincristine (Oncovin), and Prednisolone delivered over a 19–25 week cycle.',
    contraindications: [
      'Doxorubicin: contraindicated in cats at standard dog doses (risk of acute hypersensitivity); dose-limited cardiac toxicity in dogs with pre-existing cardiomyopathy',
      'Cyclophosphamide: monitor for sterile haemorrhagic cystitis — ensure adequate hydration and furosemide co-administration',
      'All chemotherapy agents: should only be administered by trained personnel with appropriate PPE and biohazard waste disposal',
      'Severely immunocompromised animals with active infection should not receive chemotherapy until infection is controlled',
    ],
    vetNotes:
      'Complete staging (thoracic radiographs, abdominal ultrasound, lymph node aspirates, CBC, chemistry, urinalysis) is required before initiation. Monitor CBC weekly — neutropaenia (ANC <1500/μL) requires protocol adjustment or delay. Client counselling on zoonotic risk of handling patient\'s waste during treatment is mandatory.',
    estimatedDuration: '19–25 weeks (full protocol)',
    estimatedCost: '$5,000–$10,000+ USD',
    successRate: 75,
    steps: [
      {
        title: 'Complete disease staging',
        description: 'CBC, serum biochemistry, urinalysis. Thoracic radiographs (3 views). Abdominal ultrasound. Fine-needle aspirate of enlarged lymph node for cytology. Bone marrow aspirate if indicated.',
        durationMinutes: 90,
      },
      {
        title: 'Owner counselling and consent',
        description: 'Discuss diagnosis, prognosis (median survival 12–14 months with CHOP), protocol schedule, monitoring requirements, expected side effects, and cost. Obtain written informed consent.',
        durationMinutes: 30,
      },
      {
        title: 'Administer Week 1 drugs (Vincristine + Prednisolone)',
        description: 'Vincristine 0.7 mg/m² IV slowly (perivascular extravasation causes severe tissue necrosis — use butterfly catheter). Start prednisolone at prescribed dose PO.',
        durationMinutes: 30,
      },
      {
        title: 'Administer doxorubicin (Week 2)',
        description: 'Pre-medicate with diphenhydramine to reduce hypersensitivity risk. Administer doxorubicin 30 mg/m² (dog) as slow IV infusion over 20–30 min. Monitor for hypersensitivity reactions.',
        durationMinutes: 45,
      },
      {
        title: 'CBC monitoring and supportive care',
        description: 'CBC at each visit. If ANC <1500: delay next dose, dispense prophylactic antibiotics. GI support (ondansetron, famotidine) as needed for nausea. Track tumour response.',
        durationMinutes: 20,
      },
    ],
  },
  {
    name: 'Dental Prophylaxis and Oral Examination Under Anaesthesia',
    description:
      'Comprehensive oral health procedure performed under general anaesthesia, including thorough examination of all dental structures, full-mouth dental radiography, supragingival and subgingival scaling, polishing, and extraction of non-viable teeth.',
    contraindications: [
      'Uncontrolled systemic disease (cardiac, renal, hepatic) should be stabilised before elective anaesthesia',
      'Active coagulopathy requires correction before extractions',
      'Severe anaemia (PCV <20%) is a relative contraindication for elective procedures',
    ],
    vetNotes:
      'Pre-anaesthetic bloodwork is recommended for all patients, mandatory for patients >7 years. Full-mouth dental radiography is essential — approximately 50 % of pathology is below the gum line and invisible without radiographs. Discuss home dental care (daily toothbrushing, dental diets, rinses) at discharge.',
    estimatedDuration: '60–180 minutes (procedure)',
    estimatedCost: '$300–$1,200 USD depending on extractions required',
    successRate: 95,
    steps: [
      {
        title: 'Pre-anaesthetic assessment',
        description: 'Review bloodwork, assess ASA status. Place IV catheter. Administer pre-anaesthetic medications (opioid, anticholinergic, sedative as indicated).',
        durationMinutes: 20,
      },
      {
        title: 'Induce and intubate',
        description: 'Induce anaesthesia with propofol or alfaxalone IV. Place cuffed endotracheal tube (inflate cuff) to protect airway from water/debris. Pack pharynx with moist gauze.',
        durationMinutes: 10,
      },
      {
        title: 'Full-mouth oral examination and dental radiography',
        description: 'Systematically examine all teeth, gingiva, mucosa, tongue, and palate. Chart findings. Take full-mouth dental radiographs using intraoral sensor.',
        durationMinutes: 30,
      },
      {
        title: 'Scaling and polishing',
        description: 'Remove supragingival calculus with ultrasonic scaler. Perform subgingival scaling with hand curettes. Polish all teeth with prophy paste to remove micro-abrasions.',
        durationMinutes: 30,
      },
      {
        title: 'Extractions and oral surgery (as required)',
        description: 'Extract non-viable teeth using closed or surgical technique per tooth category. Place absorbable sutures to close extraction sites.',
        durationMinutes: 60,
      },
      {
        title: 'Recovery and discharge instructions',
        description: 'Remove pharyngeal gauze. Recover in warm, quiet area with monitoring until sternal. Discharge with pain relief, antibiotics if indicated, and home care instructions.',
        durationMinutes: 30,
      },
    ],
  },
  {
    name: 'Medical Management of Chronic Kidney Disease (CKD)',
    description:
      'Long-term multimodal management of chronic irreversible renal disease, focused on slowing progression, managing clinical signs (nausea, hypertension, anaemia, phosphate retention), maintaining hydration, and optimising quality of life. IRIS staging guides treatment intensity.',
    contraindications: [
      'NSAIDs: contraindicated — nephrotoxic, reduce renal blood flow',
      'Aminoglycoside antibiotics (gentamicin, amikacin): avoid, nephrotoxic',
      'ACE inhibitors: use with caution if severe volume depletion; monitor electrolytes',
      'Erythropoiesis-stimulating agents (darbepoetin): risk of pure red cell aplasia with prolonged use',
    ],
    vetNotes:
      'IRIS CKD staging based on fasted creatinine ± SDMA and substaged by proteinuria (UPC) and blood pressure. Renal therapeutic diet (protein-restricted, phosphate-restricted, buffered) is the single most evidence-based intervention for slowing CKD progression. Monitor SDMA, creatinine, BUN, phosphate, PCV, and blood pressure every 3–6 months.',
    estimatedDuration: 'Lifelong management',
    estimatedCost: '$100–$400 USD/month',
    successRate: 70,
    steps: [
      {
        title: 'IRIS staging and baseline diagnostics',
        description: 'Fasted creatinine and SDMA for IRIS stage. Urine protein:creatinine ratio (UPC). Blood pressure measurement. CBC, full biochemistry, and urinalysis. Abdominal ultrasound for renal architecture.',
        durationMinutes: 45,
      },
      {
        title: 'Dietary transition to renal prescription diet',
        description: 'Transition gradually over 2–4 weeks to a veterinary renal diet. Ensure adequate caloric intake — palatability is critical. Consider adding water to food to increase hydration.',
        durationMinutes: 10,
      },
      {
        title: 'Phosphate management',
        description: 'If serum phosphate above IRIS target after dietary change: initiate intestinal phosphate binders (aluminium hydroxide, calcium carbonate, or sevelamer) with meals.',
        durationMinutes: 10,
      },
      {
        title: 'Blood pressure control',
        description: 'If systolic BP >160 mmHg on ≥3 measurements: initiate amlodipine (cats) or benazepril/enalapril (dogs/cats). Target: <140 mmHg. Recheck BP in 1–2 weeks.',
        durationMinutes: 15,
      },
      {
        title: 'Anaemia management',
        description: 'If PCV <20 %: consider darbepoetin alfa SQ q1–2 weeks. Ensure adequate iron stores. Monitor PCV q2–4 weeks. Anti-nausea medication (maropitant, omeprazole) for uraemic signs.',
        durationMinutes: 15,
      },
      {
        title: 'Fluid therapy and hydration support',
        description: 'Subcutaneous fluid therapy at home (50–150 mL daily or every other day) greatly improves QoL in later-stage CKD. Train owners on SQ fluid administration technique.',
        durationMinutes: 20,
      },
      {
        title: 'Ongoing monitoring',
        description: 'Recheck every 3–6 months: bloodwork, urinalysis, UPC, BP. Adjust management based on IRIS substage changes. Consider referral for advanced staging.',
        durationMinutes: 30,
      },
    ],
  },
  {
    name: 'Medical Management of Diabetes Mellitus',
    description:
      'Long-term insulin therapy combined with dietary management and glucose monitoring for cats or dogs diagnosed with diabetes mellitus. Cats predominantly have Type 2 diabetes; dogs are almost exclusively Type 1 (insulin-dependent). With tight regulation, cats may achieve diabetic remission.',
    contraindications: [
      'Insulin must not be administered if blood glucose is <4 mmol/L (72 mg/dL) — risk of life-threatening hypoglycaemia',
      'Concurrent hypokalaemia should be corrected before initiating insulin in DKA',
      'Untreated infections (especially dental disease, pyometra, UTI) impair regulation — address concurrent disease first',
    ],
    vetNotes:
      'Cats: glargine (Lantus) or PZI insulin BID is preferred. Dogs: neutral protamine Hagedorn (NPH) insulin BID. Serial glucose curves (8–10 h; measure q2h) are used for dose adjustment — aim for nadir 5–8 mmol/L and pre-insulin <14 mmol/L. Fructosamine reflects average glucose over 2–3 weeks.',
    estimatedDuration: 'Lifelong (unless remission achieved in cats)',
    estimatedCost: '$150–$500 USD/month',
    successRate: 80,
    steps: [
      {
        title: 'Confirm diagnosis',
        description: 'Persistent fasting hyperglycaemia AND glucosuria required. Fructosamine to confirm chronicity (rules out stress hyperglycaemia in cats). Urinalysis and culture to check for UTI.',
        durationMinutes: 30,
      },
      {
        title: 'Initiate insulin therapy',
        description: 'Cats: Glargine 1–2 U per cat BID SQ or start at 0.5 U/kg BID. Dogs: NPH 0.25–0.5 U/kg BID SQ. Always administer after a meal to avoid hypoglycaemia.',
        durationMinutes: 15,
      },
      {
        title: 'Dietary management',
        description: 'Cats: high protein, low carbohydrate diet (canned food preferred). Dogs: consistent high-fibre diet fed in two equal meals at time of insulin injections.',
        durationMinutes: 15,
      },
      {
        title: 'Perform initial glucose curve',
        description: 'Hospitalise for 8–12 h serial blood glucose curve 5–7 days after initiating insulin. Measure glucose every 2 h. Assess nadir, duration of action, and pre-insulin glucose.',
        durationMinutes: 480,
      },
      {
        title: 'Owner training',
        description: 'Demonstrate insulin drawing, injection technique, and SQ injection sites. Teach signs of hypoglycaemia (weakness, trembling, seizures) and emergency response (oral karo syrup). Provide monitoring diary.',
        durationMinutes: 30,
      },
      {
        title: 'Ongoing monitoring and dose adjustment',
        description: 'Recheck glucose curve every 1–4 weeks until stable, then every 3 months. Adjust dose by 0.5–1 U increments. Fructosamine every 3 months. Aim for clinical signs resolution and good QoL.',
        durationMinutes: 60,
      },
    ],
  },
  {
    name: 'Wound Management and Debridement',
    description:
      'Assessment, cleaning, debridement, and appropriate closure or open management of traumatic, infected, or non-healing wounds. Includes lavage, removal of necrotic tissue, drain placement where indicated, and bandaging protocol.',
    contraindications: [
      'Heavily contaminated or infected wounds should not be primarily closed — open wound management or delayed primary closure is preferred',
      'Closure over poorly vascularised tissue increases risk of dehiscence',
      'Anaesthetic agents must be chosen carefully in haemodynamically unstable patients',
    ],
    vetNotes:
      'Wound age, contamination level, tissue viability, and location dictate management approach. "The solution to pollution is dilution" — copious lavage (500–2000 mL sterile saline at 7–10 PSI) is key. Open wound management with wet-to-dry or VAC dressings for infected wounds. Primary closure ideally within 6 h of injury.',
    estimatedDuration: '1–14 days depending on wound severity',
    estimatedCost: '$200–$2,000 USD',
    successRate: 88,
    steps: [
      {
        title: 'Wound assessment and patient stabilisation',
        description: 'Assess depth, extent, contamination, and tissue viability. Stabilise patient first (haemorrhage control, treat shock). Pain assessment and analgesia.',
        durationMinutes: 20,
      },
      {
        title: 'Clip and clean wound margins',
        description: 'Clip hair from wound margin. Protect wound with sterile water-soluble gel while clipping. Flush with dilute chlorhexidine solution then copious sterile saline.',
        durationMinutes: 15,
      },
      {
        title: 'Debridement',
        description: 'Remove all devitalised, necrotic, or contaminated tissue by sharp debridement, lavage, or enzymatic agents. Preserve viable tissue. Use EN block debridement in heavily contaminated wounds.',
        durationMinutes: 30,
      },
      {
        title: 'Wound closure decision',
        description: 'Assess for primary closure (clean, <6h old), delayed primary closure (at 3–5 days), or second-intention healing. Place drain if dead space or infection risk.',
        durationMinutes: 15,
      },
      {
        title: 'Bandaging',
        description: 'Apply appropriate bandage (non-adherent contact layer, absorptive secondary layer, conforming tertiary layer). Change bandage every 24–72 h based on discharge level.',
        durationMinutes: 20,
      },
      {
        title: 'Discharge and follow-up',
        description: 'Discharge with analgesics, antibiotics if indicated, Elizabethan collar. Bandage change schedule. Signs of infection to watch for. Suture removal at 10–14 days.',
        durationMinutes: 15,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// DISEASES
// ─────────────────────────────────────────────────────────────────────────────
const DISEASES = [
  // ── Feline Infectious Diseases ───────────────────────────────────────────────
  {
    name: 'Feline Panleukopenia (Feline Parvovirus)',
    description:
      'Highly contagious viral disease caused by feline parvovirus (FPV), characterised by severe bone marrow suppression, enteritis, and leukopenia. A leading cause of death in unvaccinated kittens. Virus is extremely environmentally stable (survives years in the environment).',
    causes: [
      'Infection with Feline Parvovirus (FPV — a parvovirus closely related to canine parvovirus CPV-2)',
      'Oronasal exposure to faeces, urine, vomit, or fomites from infected animals',
      'In-utero transmission causing cerebellar hypoplasia in kittens',
      'Most susceptible in unvaccinated kittens 3–5 months of age',
    ],
    symptoms: [
      'Severe vomiting and haemorrhagic diarrhoea',
      'Profound lethargy and depression',
      'High fever initially, then hypothermia in severe cases',
      'Complete anorexia',
      'Severe dehydration',
      'Leukopenia (low WBC — hallmark finding)',
      'Cerebellar ataxia and tremors (in-utero infection)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Core vaccination (FVRCP) starting at 6–8 weeks, boosters every 3–4 weeks until 16 weeks, then at 1 year, then every 3 years',
      'Strict isolation of infected animals',
      'Environmental decontamination with 1:32 bleach solution (parvovirus-stable)',
      'Avoid exposure of unvaccinated kittens to unknown animals or contaminated environments',
    ],
    treatmentMethods: [
      'Aggressive IV fluid therapy to correct dehydration and electrolyte imbalances',
      'Broad-spectrum antibiotics to prevent septicaemia from gut bacterial translocation',
      'Anti-nausea medication (maropitant, ondansetron)',
      'Nutritional support (syringe feeding or nasogastric tube)',
      'Blood or plasma transfusions for severe anaemia or hypoproteinaemia',
      'Strict barrier nursing and isolation',
    ],
    recoveryPeriod: '1–2 weeks (survivors); mortality up to 90 % in untreated kittens',
    symptomNames: ['Vomiting', 'Diarrhoea', 'Lethargy', 'Loss of Appetite', 'Dehydration', 'Fever', 'Pale Mucous Membranes'],
    treatmentNames: ['IV Fluid Resuscitation & Supportive Care', 'Antibiotic Therapy (Systemic)'],
  },
  {
    name: 'Feline Herpesvirus-1 (Feline Viral Rhinotracheitis)',
    description:
      'Endemic upper respiratory tract infection caused by Feline Herpesvirus-1 (FHV-1). A leading cause of sneezing, nasal discharge, and conjunctivitis in cats. Establishes lifelong latency in the trigeminal ganglion; reactivation triggered by stress is extremely common.',
    causes: [
      'Infection with Feline Herpesvirus-1 (FHV-1)',
      'Direct contact with ocular or nasal secretions from infected/shedding cats',
      'Stress-induced reactivation of latent virus (rehoming, hospitalisation, boarding)',
      'Multi-cat environments and shelters have high prevalence',
    ],
    symptoms: [
      'Sneezing paroxysms',
      'Bilateral mucopurulent nasal discharge',
      'Conjunctivitis with ocular discharge',
      'Corneal ulceration (dendritic ulcers pathognomonic for FHV-1)',
      'Lethargy',
      'Loss of appetite',
      'Fever in acute phase',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Core FVRCP vaccination (reduces severity but does not prevent infection or latency)',
      'Minimise stress in cats known to be latent carriers',
      'Isolation of newly acquired cats for 14 days',
      'Good hygiene and ventilation in multi-cat environments',
    ],
    treatmentMethods: [
      'Famciclovir (antiviral) orally for active FHV-1 outbreaks',
      'Cidofovir 0.5 % ophthalmic drops BID for ocular herpesvirus',
      'Broad-spectrum topical antibiotics for secondary bacterial conjunctivitis',
      'Lysine supplementation (controversial; some benefit in prevention)',
      'Nebulisation with saline to loosen nasal secretions',
      'Appetite stimulants and nutritional support',
      'NSAIDs or buprenorphine for oral pain if ulcers present',
    ],
    recoveryPeriod: '2–3 weeks (acute episode); lifelong carrier state',
    symptomNames: ['Sneezing', 'Nasal Discharge', 'Eye Discharge (Ocular Discharge)', 'Lethargy', 'Loss of Appetite', 'Fever', 'Corneal Ulceration'],
    treatmentNames: ['Antiviral & Supportive Therapy for Upper Respiratory Infection'],
  },
  {
    name: 'Feline Calicivirus (FCV) Infection',
    description:
      'Common feline upper respiratory pathogen and important cause of oral ulceration, limping syndrome in kittens, and, in virulent systemic strains (VS-FCV), severe haemorrhagic disease with high mortality. Exists as multiple antigenically diverse strains with highly variable pathogenicity.',
    causes: [
      'Infection with Feline Calicivirus (FCV — a non-enveloped RNA virus)',
      'Direct contact with oronasal secretions, aerosol droplets, or fomites',
      'Shelter and multi-cat household settings facilitate transmission',
      'Virulent systemic strains (VS-FCV) cause outbreaks with systemic disease',
    ],
    symptoms: [
      'Oral ulcers (tongue, hard palate, lips — pathognomonic pattern)',
      'Excessive salivation (ptyalism)',
      'Sneezing and nasal discharge',
      'Limping syndrome (transient polyarthritis in kittens)',
      'Fever',
      'Lethargy and anorexia',
      'Facial oedema and skin ulcers (VS-FCV)',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Core FVRCP vaccination (bivalent calicivirus strains included)',
      'Isolation of new cats for 14 days in multi-cat settings',
      'Environmental disinfection (FCV inactivated by hypochlorite 1:32)',
      'Annual boosters in high-risk environments (catteries, shelters)',
    ],
    treatmentMethods: [
      'Supportive care: fluid therapy for dehydration, anti-nausea medication',
      'Analgesia (buprenorphine) for oral pain — critical for encouraging food intake',
      'Soft or liquidised food to minimise oral discomfort',
      'Antibiotics for secondary bacterial infection',
      'Antiviral interferon omega in severe cases (limited evidence)',
    ],
    recoveryPeriod: '1–3 weeks (acute); chronic carriers common',
    symptomNames: ['Oral Ulcers/Stomatitis', 'Sneezing', 'Nasal Discharge', 'Fever', 'Lethargy', 'Loss of Appetite'],
    treatmentNames: ['Antiviral & Supportive Therapy for Upper Respiratory Infection'],
  },
  {
    name: 'Feline Leukaemia Virus (FeLV) Infection',
    description:
      'Oncogenic retrovirus that integrates into the feline host genome, causing progressive immunosuppression, anaemia, lymphoma, and other neoplastic and non-neoplastic diseases. The most important retroviral infection in cats; typically fatal within 3 years of progressive infection.',
    causes: [
      'Infection with Feline Leukaemia Virus (FeLV — a retrovirus)',
      'Exposure to infected cats via mutual grooming, shared food/water bowls, bite wounds',
      'In-utero or colostral transmission to kittens from infected queens',
      'Greatest risk: outdoor cats, multi-cat households, cats with FIV co-infection',
    ],
    symptoms: [
      'Weight loss and muscle wasting',
      'Lethargy and weakness',
      'Lymphadenopathy (enlargement of lymph nodes)',
      'Pale mucous membranes (anaemia — hallmark finding)',
      'Jaundice in haemolytic anaemia cases',
      'Recurrent infections (secondary to immunosuppression)',
      'Oral ulcers and gingivitis',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Test all cats before introduction to a household',
      'FeLV vaccination for outdoor or at-risk cats',
      'Keep FeLV-positive cats strictly indoors and separated from FeLV-negative cats',
      'Test and remove (or isolate) positive cats in catteries',
      'Neutering reduces fighting and exposure risk',
    ],
    treatmentMethods: [
      'No curative treatment available for FeLV infection itself',
      'Supportive care: treat secondary infections aggressively',
      'Blood transfusions or darbepoetin for non-regenerative anaemia',
      'Prednisolone for immune-mediated anaemia',
      'Chemotherapy if FeLV-associated lymphoma develops',
      'Optimal nutrition and stress reduction to support immune function',
    ],
    recoveryPeriod: 'Progressive disease — median survival 2–3 years post-diagnosis',
    symptomNames: ['Weight Loss', 'Lethargy', 'Lymphadenopathy', 'Pale Mucous Membranes', 'Loss of Appetite'],
    treatmentNames: ['IV Fluid Resuscitation & Supportive Care', 'Antibiotic Therapy (Systemic)'],
  },
  {
    name: 'Feline Immunodeficiency Virus (FIV) Infection',
    description:
      'Lentiviral infection causing progressive CD4+ T-lymphocyte depletion and immunosuppression, leading to secondary infections and immune-mediated disease. Transmitted primarily via bite wounds. FIV-positive cats can live many years with good quality of life if managed appropriately.',
    causes: [
      'Infection with Feline Immunodeficiency Virus (FIV — a lentivirus, related to HIV)',
      'Deep bite wounds from infected cats are the primary transmission route',
      'Outdoor intact males in dense cat populations are at highest risk',
      'Vertical transmission (queen to kitten) possible but uncommon',
    ],
    symptoms: [
      'Recurrent and chronic infections (respiratory, skin, urinary)',
      'Oral ulcers and severe stomatitis (hallmark)',
      'Lymphadenopathy',
      'Chronic weight loss',
      'Lethargy',
      'Neurological signs (seizures, behavioural change) in advanced disease',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Neuter cats to reduce fighting behaviour',
      'Keep FIV-positive cats strictly indoors',
      'Test all cats before introduction to a household (note: maternal antibody in kittens can give false positives until 6 months of age)',
      'Available FIV vaccine (variable geographic coverage — consult current AAFP guidelines)',
    ],
    treatmentMethods: [
      'No curative treatment — management of secondary infections and complications',
      'Aggressive antibiotic therapy for bacterial infections',
      'Antifungal treatment for opportunistic fungal disease',
      'Management of stomatitis (dental extractions, chlorhexidine rinse, immunomodulatory drugs)',
      'Anti-retroviral therapy (zidovudine — limited use, haematotoxic)',
      'Optimal nutrition and stress-free environment',
      'Regular monitoring (CBC, biochemistry, urinalysis every 6 months)',
    ],
    recoveryPeriod: 'Lifelong management; asymptomatic period can last years',
    symptomNames: ['Oral Ulcers/Stomatitis', 'Lethargy', 'Weight Loss', 'Lymphadenopathy'],
    treatmentNames: ['Antibiotic Therapy (Systemic)', 'Dental Prophylaxis and Oral Examination Under Anaesthesia'],
  },

  // ── Feline Non-Infectious ─────────────────────────────────────────────────────
  {
    name: 'Feline Hyperthyroidism',
    description:
      'The most common endocrine disease in cats, caused by autonomous overproduction of thyroid hormones (T3/T4) by one or both thyroid lobes. Typical presentation is an older cat with weight loss despite polyphagia, hyperactivity, and vomiting. Excellent prognosis with appropriate treatment.',
    causes: [
      'Benign thyroid adenoma or adenomatous hyperplasia (>98 % of cases)',
      'Thyroid carcinoma (rare, <2 %)',
      'Iodine excess or deficiency in diet (proposed contributing factor)',
      'Chronic dietary exposure to polybrominated diphenyl ethers (PBDEs) and other endocrine disruptors from canned food or environment',
      'Typically affects cats >10 years of age',
    ],
    symptoms: [
      'Weight loss despite increased appetite (polyphagia)',
      'Increased thirst and urination (PU/PD)',
      'Hyperactivity, restlessness, aggression',
      'Vomiting and diarrhoea',
      'Unkempt coat and patchy alopecia',
      'Palpable ventral neck mass (enlarged thyroid)',
      'Tachycardia and hypertrophic cardiomyopathy (secondary)',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'No proven prevention — screening older cats (>8 years) annually with T4 measurement',
      'Annual physical examination of thyroid glands in cats >10 years',
      'Monitor blood pressure in hyperthyroid cats (commonly hypertensive)',
    ],
    treatmentMethods: [
      'Methimazole (medical management) — daily oral or transdermal pinna application; most common initial treatment',
      'Iodine-restricted prescription diet (Hill\'s y/d) — effective but requires strict dietary compliance',
      'Radioactive iodine (I-131) — curative in >95 % of cases; treatment of choice where available',
      'Surgical thyroidectomy — curative; requires experienced surgeon and pre-operative stabilisation',
      'Monitor for post-treatment CKD unmasking (restored renal blood flow may reveal underlying CKD)',
    ],
    recoveryPeriod: 'Medical management ongoing; I-131 or surgery curative within 1–3 months',
    symptomNames: ['Weight Loss', 'Increased Thirst (Polydipsia)', 'Increased Urination (Polyuria)', 'Vomiting', 'Diarrhoea'],
    treatmentNames: ['Medical Management of Chronic Kidney Disease (CKD)'],
  },
  {
    name: 'Feline Chronic Kidney Disease (CKD)',
    description:
      'Progressive, irreversible deterioration of renal function affecting >30 % of cats >10 years of age, making it one of the most prevalent diseases in geriatric cats. Characterised by reduced GFR, azotaemia, and eventually uraemia. IRIS staging guides management and prognosis.',
    causes: [
      'Chronic interstitial nephritis (most common, idiopathic)',
      'Polycystic kidney disease (PKD — genetic in Persians)',
      'Renal lymphoma',
      'Chronic pyelonephritis',
      'Renal infarction or hypertensive nephropathy',
      'Previous acute kidney injury',
      'Nephrotoxin exposure (NSAIDs, aminoglycosides, Easter lilies)',
    ],
    symptoms: [
      'Increased thirst and urination (PU/PD)',
      'Weight loss and muscle wasting',
      'Lethargy and weakness',
      'Loss of appetite',
      'Vomiting (uraemic gastritis)',
      'Halitosis (uraemic breath — ammonia-like odour)',
      'Pale mucous membranes (non-regenerative anaemia)',
      'Hypertension-related signs (blindness, retinal detachment)',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Annual bloodwork and urinalysis in cats >7 years',
      'SDMA testing for early detection (detects CKD 17 months earlier than creatinine)',
      'Blood pressure monitoring in older cats',
      'Avoid nephrotoxic medications',
      'Ensure adequate hydration (wet food diet)',
    ],
    treatmentMethods: [
      'Renal prescription diet (protein/phosphate/sodium restriction)',
      'Phosphate binders (aluminium hydroxide, sevelamer) to control hyperphosphataemia',
      'Antihypertensive therapy (amlodipine 0.625–1.25 mg/cat SID)',
      'Darbepoetin alfa for non-regenerative anaemia',
      'Subcutaneous fluid therapy at home for advanced stages',
      'Anti-nausea medication (maropitant) and H2 antagonists for uraemic gastritis',
      'Potassium supplementation for hypokalaemia (common in CKD cats)',
    ],
    recoveryPeriod: 'Lifelong progressive disease; median survival 2–3 years post-IRIS Stage 2 diagnosis',
    symptomNames: ['Increased Thirst (Polydipsia)', 'Weight Loss', 'Lethargy', 'Loss of Appetite', 'Vomiting', 'Halitosis (Bad Breath)', 'Pale Mucous Membranes'],
    treatmentNames: ['Medical Management of Chronic Kidney Disease (CKD)'],
  },
  {
    name: 'Feline Lower Urinary Tract Disease (FLUTD) / Feline Idiopathic Cystitis (FIC)',
    description:
      'Syndrome encompassing multiple lower urinary tract conditions in cats (urolithiasis, urethral plugs, idiopathic cystitis). Feline idiopathic cystitis (FIC) is the most common cause in cats <10 years, strongly associated with stress and indoor sedentary lifestyle. Urethral obstruction is a life-threatening emergency, predominantly in male cats.',
    causes: [
      'Feline idiopathic cystitis (FIC) — sterile inflammation, stress-related (most common < 10 yr)',
      'Urolithiasis (struvite or calcium oxalate crystals/stones)',
      'Urethral plugs (protein matrix with mineral deposits)',
      'Bacterial urinary tract infection (more common in older/immunosuppressed cats)',
      'Anatomical abnormalities',
      'Stress, obesity, indoor lifestyle, dry food diet are risk factors',
    ],
    symptoms: [
      'Straining to urinate with small or no urine output',
      'Blood in urine (haematuria)',
      'Frequent attempts to urinate with small volumes',
      'Vocalisation while urinating',
      'Urinating outside the litter box',
      'Licking at genital area',
      'Complete inability to urinate (urethral obstruction — emergency)',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Increase water intake (wet food, water fountains, multiple water sources)',
      'Weight management and environmental enrichment',
      'Reduce stressors in the environment (adequate litter boxes — n+1 rule)',
      'Urinary prescription diet (dissolution of struvite; calcium oxalate prevention)',
      'Pheromone diffusers (Feliway) to reduce stress-related FIC',
      'Slow introduction of new animals or changes in routine',
    ],
    treatmentMethods: [
      'Urethral catheterisation for obstruction — emergency procedure',
      'IV fluid therapy for dehydration and hyperkalaemia correction',
      'Anti-inflammatory treatment (prednisolone) for FIC',
      'Analgesics (buprenorphine, meloxicam) for urinary pain',
      'Antispasmodics (prazosin) to relax urethral smooth muscle',
      'Urinary prescription diet or dissolution diet',
      'Environmental enrichment and stress reduction',
      'Perineal urethrostomy for recurrent male cats',
    ],
    recoveryPeriod: 'Acute episode 5–7 days; FIC is recurrent without environmental management',
    symptomNames: ['Straining to Urinate (Stranguria/Dysuria)', 'Haematuria (Blood in Urine)', 'Increased Urination (Polyuria)', 'Abdominal Pain'],
    treatmentNames: ['Surgical Management of Urethral Obstruction (Cats)', 'IV Fluid Resuscitation & Supportive Care'],
  },
  {
    name: 'Feline Diabetes Mellitus',
    description:
      'Endocrine disorder characterised by persistent hyperglycaemia resulting from impaired insulin secretion and/or insulin resistance. Cats primarily develop Type 2-like diabetes (non-insulin-dependent in early stages). Obesity is the strongest risk factor. Diabetic remission is achievable with tight glycaemic control in 50–70 % of cats.',
    causes: [
      'Obesity — most important risk factor in cats (increases insulin resistance 4-fold)',
      'Pancreatic beta-cell exhaustion from chronic amyloid deposition (IAPP)',
      'Concurrent disease causing insulin resistance (acromegaly, hyperadrenocorticism, infection)',
      'Long-term corticosteroid or progestogen use (iatrogenic)',
      'Genetic predisposition in Burmese cats',
      'Sedentary indoor lifestyle',
    ],
    symptoms: [
      'Excessive thirst (polydipsia)',
      'Excessive urination (polyuria)',
      'Weight loss despite polyphagia (increased appetite)',
      'Plantigrade stance (walking on hocks due to diabetic neuropathy)',
      'Unkempt coat',
      'Lethargy',
      'Vomiting (if concurrent diabetic ketoacidosis)',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Maintain healthy body weight (BCS 4–5/9)',
      'High protein, low carbohydrate diet (avoid dry carbohydrate-rich diets)',
      'Regular exercise and environmental enrichment',
      'Avoid unnecessary corticosteroids or progestogens',
      'Annual blood glucose and urinalysis screening in obese or at-risk cats (Burmese)',
    ],
    treatmentMethods: [
      'Insulin therapy — glargine (Lantus) or PZI insulin BID SQ (treatment of choice for cats)',
      'High protein, low carbohydrate diet (essential for diabetic remission)',
      'Weight management programme',
      'Serial glucose curves to monitor glycaemic control and adjust insulin dose',
      'Vitamin B12 supplementation for peripheral neuropathy',
      'Management of concurrent disease (treat infections, discontinue diabetogenic drugs)',
    ],
    recoveryPeriod: 'Lifelong management; remission (insulin independence) possible in 50–70 % with tight control',
    symptomNames: ['Increased Thirst (Polydipsia)', 'Increased Urination (Polyuria)', 'Weight Loss', 'Lethargy', 'Vomiting'],
    treatmentNames: ['Medical Management of Diabetes Mellitus'],
  },

  // ── Canine Diseases ───────────────────────────────────────────────────────────
  {
    name: 'Canine Parvovirus Enteritis (CPV-2)',
    description:
      'Highly contagious viral disease caused by Canine Parvovirus type 2 (CPV-2), characterised by acute haemorrhagic gastroenteritis, profuse bloody diarrhoea, vomiting, severe leukopenia, and high mortality in unvaccinated puppies. Virus is resistant to most disinfectants and persists in the environment for months to years.',
    causes: [
      'Infection with Canine Parvovirus type 2 (CPV-2a, 2b, or 2c)',
      'Faecal-oral route of transmission',
      'Environmental contamination — virus is extremely stable',
      'Most susceptible: unvaccinated puppies 6 weeks–6 months',
      'High-risk breeds: Rottweilers, Doberman Pinschers, American Staffordshire Terriers',
      'Immune suppression (malnutrition, concurrent disease, endoparasites)',
    ],
    symptoms: [
      'Profuse haemorrhagic diarrhoea (bloody — characteristic foul odour)',
      'Severe vomiting',
      'Lethargy and depression',
      'Complete anorexia',
      'Fever (may be hypothermic in decompensating shock)',
      'Severe dehydration',
      'Abdominal pain',
      'Pale mucous membranes (from haemorrhage and shock)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Core vaccination (DA2PP) starting at 6–8 weeks, boosters every 3–4 weeks until 16–20 weeks',
      'Avoid unvaccinated puppy exposure to public areas until fully vaccinated',
      'Environmental decontamination with diluted bleach (1:30) — only effective agent',
      'Quarantine of suspected cases',
      'Avoid shelters or dog parks until vaccination series complete',
    ],
    treatmentMethods: [
      'Aggressive IV fluid and electrolyte therapy (primary treatment)',
      'Broad-spectrum antibiotics (ampicillin + enrofloxacin or metronidazole) for sepsis prevention',
      'Anti-emetics (maropitant, ondansetron)',
      'Nutritional support (early enteral feeding via NE tube improves outcome)',
      'Recombinant granulocyte colony-stimulating factor (rG-CSF) to stimulate WBC recovery',
      'Colloid therapy (fresh frozen plasma) for hypoproteinaemia and shock',
      'Strict isolation and barrier nursing',
    ],
    recoveryPeriod: '5–7 days with intensive treatment; mortality 1–5 % with treatment, up to 91 % without',
    symptomNames: ['Diarrhoea', 'Vomiting', 'Lethargy', 'Loss of Appetite', 'Fever', 'Dehydration', 'Abdominal Pain', 'Pale Mucous Membranes'],
    treatmentNames: ['IV Fluid Resuscitation & Supportive Care', 'Antibiotic Therapy (Systemic)'],
  },
  {
    name: 'Canine Distemper Virus (CDV) Infection',
    description:
      'Serious multisystemic viral disease of dogs (and other carnivores) caused by Canine Morbillivirus. Affects the respiratory, gastrointestinal, and central nervous systems. A leading cause of death in unvaccinated dogs worldwide. Neurological signs may develop weeks after recovery from systemic illness.',
    causes: [
      'Infection with Canine Distemper Virus (CDV — a paramyxovirus)',
      'Aerosol droplets and respiratory secretions from infected animals',
      'Contact with body fluids (urine, faeces, saliva) of infected dogs',
      'Wildlife reservoir: foxes, wolves, raccoons, ferrets, seals',
      'Most susceptible: unvaccinated puppies 3–6 months',
    ],
    symptoms: [
      'Purulent nasal and ocular discharge',
      'Coughing and respiratory distress (pneumonia)',
      'Fever (biphasic)',
      'Vomiting and diarrhoea',
      'Hyperkeratosis of nasal planum and footpads ("hard pad disease")',
      'Neurological signs: seizures, ataxia, myoclonus (muscle twitching)',
      'Enamel hypoplasia of permanent teeth (in recovering puppies)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Core DA2PP vaccination beginning at 6–8 weeks, repeated every 3–4 weeks until 16 weeks, then 1-year booster',
      'Avoid contact with wildlife and unvaccinated dogs',
      'Isolation of suspected cases',
    ],
    treatmentMethods: [
      'No specific antiviral treatment available — purely supportive',
      'IV fluid therapy for systemic support and hydration',
      'Antibiotics for secondary bacterial pneumonia (amoxicillin-clavulanate, doxycycline)',
      'Anticonvulsants (phenobarbital, diazepam) for seizure control',
      'Anti-emetics and GI protectants',
      'Nutritional support — assisted feeding if anorectic',
      'Physical therapy and supportive nursing for neurological cases',
    ],
    recoveryPeriod: '2–4 weeks (acute phase); neurological signs may be permanent',
    symptomNames: ['Fever', 'Nasal Discharge', 'Eye Discharge (Ocular Discharge)', 'Coughing', 'Vomiting', 'Diarrhoea', 'Seizures (Epilepsy)', 'Ataxia (Loss of Coordination)'],
    treatmentNames: ['IV Fluid Resuscitation & Supportive Care', 'Antibiotic Therapy (Systemic)'],
  },
  {
    name: 'Canine Infectious Tracheobronchitis (Kennel Cough)',
    description:
      'Highly contagious upper respiratory syndrome of dogs characterised by a harsh, honking cough. Caused by multiple pathogens acting synergistically, most commonly Bordetella bronchiseptica combined with canine parainfluenza virus. Self-limiting in immunocompetent adult dogs but can progress to pneumonia in young, elderly, or immunocompromised animals.',
    causes: [
      'Bordetella bronchiseptica (most important bacterial pathogen)',
      'Canine parainfluenza virus (CPiV)',
      'Canine adenovirus-2 (CAV-2)',
      'Canine coronavirus, Mycoplasma spp. (contributing pathogens)',
      'Exposure in kennels, dog parks, training classes, grooming salons',
      'Stress, crowding, and poor ventilation are predisposing factors',
    ],
    symptoms: [
      'Dry, harsh, honking cough (goose-honk characteristic)',
      'Gagging and expectoration of white foam after coughing',
      'Sneezing',
      'Nasal discharge (serous to mucopurulent)',
      'Generally well systemically (afebrile in mild cases)',
      'Exercise intolerance',
      'Fever and lethargy in severe/complicated cases',
    ],
    severity: 'LOW' as const,
    preventionMethods: [
      'Intranasal or oral Bordetella vaccination before boarding/kennelling (effective within 72 h)',
      'DA2PP vaccination provides protection against CAV-2 and CPiV components',
      'Avoid exposure in kennels during outbreaks',
      'Good ventilation and hygiene in communal dog areas',
    ],
    treatmentMethods: [
      'Rest and reduced exercise for 1–2 weeks',
      'Cough suppressants (butorphanol, hydrocodone) for comfort',
      'Doxycycline for 10–14 days for Bordetella component',
      'Steam/humidity exposure (bathroom steam) for mucosal soothing',
      'Chest radiographs if progression to pneumonia suspected',
      'Hospitalisation and IV antibiotics for complicated pneumonia',
    ],
    recoveryPeriod: '1–3 weeks in uncomplicated cases',
    symptomNames: ['Coughing', 'Sneezing', 'Nasal Discharge', 'Lethargy', 'Fever'],
    treatmentNames: ['Antibiotic Therapy (Systemic)'],
  },
  {
    name: 'Canine Lymphoma',
    description:
      'The most common haematopoietic malignancy in dogs, accounting for 7–14 % of all canine tumours. Most commonly presents as multicentric lymphoma (generalised lymphadenopathy). Other forms include alimentary, mediastinal, and cutaneous lymphoma. Intermediate to high-grade B-cell lymphoma responds best to chemotherapy.',
    causes: [
      'Aetiology largely unknown — multifactorial',
      'Chromosomal abnormalities and oncogene activation',
      'Environmental exposures (herbicides, electromagnetic fields — inconclusive evidence)',
      'Breed predisposition: Golden Retrievers, Boxers, Bulldogs, Rottweilers, Scottish Terriers',
      'Immune dysregulation',
    ],
    symptoms: [
      'Rapidly enlarging, non-painful peripheral lymph nodes (multicentric)',
      'Lethargy and decreased activity',
      'Weight loss and muscle wasting',
      'Loss of appetite',
      'Vomiting and diarrhoea (alimentary form)',
      'Dyspnoea and exercise intolerance (mediastinal form)',
      'Increased thirst and urination (paraneoplastic hypercalcaemia — T-cell lymphoma)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'No proven prevention',
      'Regular physical examination — screen peripheral lymph nodes in predisposed breeds',
      'Early detection improves prognosis',
    ],
    treatmentMethods: [
      'CHOP-based chemotherapy protocol (cyclophosphamide, doxorubicin, vincristine, prednisolone) — first-line, ~85 % remission rate',
      'Prednisolone alone as palliative treatment (without prior CHOP) reduces remission rate with rescue protocols',
      'L-asparaginase induction for high-grade lymphoma',
      'Rescue protocols (LOPP, MOPP, rabacfosadine) for relapsed disease',
      'Radiotherapy for solitary or Stage I disease',
      'Nutritional support throughout treatment',
    ],
    recoveryPeriod: 'Median survival 12–14 months with CHOP; ~20–25 % survive >2 years',
    symptomNames: ['Lymphadenopathy', 'Lethargy', 'Weight Loss', 'Loss of Appetite', 'Exercise Intolerance'],
    treatmentNames: ['Chemotherapy Protocol (CHOP-Based Lymphoma)'],
  },
  {
    name: 'Canine Patellar Luxation',
    description:
      'Displacement of the patella (kneecap) from its normal position in the trochlear groove of the femur. Most commonly medial (MPL) in small breeds. Graded I–IV based on reducibility and severity. Grade III–IV causes consistent lameness and requires surgical correction.',
    causes: [
      'Congenital skeletal malalignment (most common) — shallow trochlear groove, medial displacement of tibial tuberosity',
      'Genetic predisposition: Toy and small breeds (Yorkshire Terrier, Pomeranian, Chihuahua, Miniature Poodle)',
      'Traumatic injury (less common, typically lateral luxation in large breeds)',
      'Obesity — additional loading of dysplastic joints',
    ],
    symptoms: [
      'Intermittent non-weight-bearing on hindlimb ("skipping" gait)',
      'Sudden onset of lameness then resolution after patella relocates',
      'Continuous lameness in Grade III–IV cases',
      'Hindlimb held extended while shaking',
      'Medial bowing of stifle joint',
      'Muscle atrophy of affected limb (chronic cases)',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Weight management — obesity exacerbates patellar luxation',
      'Avoid purchasing high-risk breeds from lines with known patellar problems (screen breeding dogs)',
      'Avoid high-impact exercise in known Grade I–II cases',
    ],
    treatmentMethods: [
      'Grade I–II: conservative management (weight loss, physiotherapy, joint supplements)',
      'Grade III–IV: surgical correction — trochleoplasty, tibial tuberosity transposition, femoral/tibial correction osteotomy',
      'Post-surgical physiotherapy and hydrotherapy',
      'NSAIDs for pain management (meloxicam, carprofen)',
      'Glucosamine/chondroitin supplementation for secondary osteoarthritis',
    ],
    recoveryPeriod: '6–8 weeks post-surgery for primary repair; ongoing management for osteoarthritis',
    symptomNames: ['Lameness', 'Muscle Wasting (Cachexia/Sarcopaenia)'],
    treatmentNames: ['Wound Management and Debridement'],
  },
  {
    name: 'Canine Diabetes Mellitus',
    description:
      'Endocrine disorder characterised by absolute insulin deficiency (Type 1, most common in dogs) resulting in persistent hyperglycaemia, glucosuria, and clinical signs of PU/PD and weight loss. Unlike cats, spontaneous diabetic remission is rare in dogs, making lifelong insulin therapy the standard of care.',
    causes: [
      'Immune-mediated destruction of pancreatic beta cells (Type 1, most common in dogs)',
      'Chronic pancreatitis causing pancreatic exocrine and endocrine insufficiency',
      'Obesity and insulin resistance contributing to beta-cell exhaustion',
      'Diestrus-associated progesterone secretion stimulating growth hormone (transient diabetes in intact females)',
      'Iatrogenic — long-term corticosteroid or megestrol acetate administration',
      'Predisposed breeds: Samoyeds, Australian Terriers, Miniature Schnauzers, Pugs, Toy Poodles, Keeshonds',
    ],
    symptoms: [
      'Polydipsia (increased thirst)',
      'Polyuria (increased urination)',
      'Polyphagia (increased appetite) with weight loss',
      'Bilateral posterior subcapsular cataracts (rapid onset in dogs — diabetic complication)',
      'Lethargy and weakness',
      'Recurrent urinary tract infections',
      'Vomiting (concurrent pancreatitis or diabetic ketoacidosis)',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Neuter intact females to eliminate diestrus-related diabetes',
      'Maintain healthy body weight — avoid obesity',
      'Avoid unnecessary corticosteroid use',
      'Annual blood glucose and urinalysis for predisposed breeds >6 years',
    ],
    treatmentMethods: [
      'NPH (neutral protamine Hagedorn) insulin BID SQ — standard of care',
      'Consistent, high-fibre diet fed at insulin injection times',
      'Serial glucose curves for dose optimisation',
      'Ophthalmoscopy for cataract monitoring — prompt referral for cataract surgery if candidate',
      'Weight management programme for obese patients',
      'Treat concurrent disease (pancreatitis, UTI, Cushing\'s)',
    ],
    recoveryPeriod: 'Lifelong management required — diabetic remission rare in dogs',
    symptomNames: ['Increased Thirst (Polydipsia)', 'Increased Urination (Polyuria)', 'Weight Loss', 'Lethargy', 'Vomiting'],
    treatmentNames: ['Medical Management of Diabetes Mellitus'],
  },

  // ── Shared/Multi-species ──────────────────────────────────────────────────────
  {
    name: 'Flea Allergy Dermatitis (FAD)',
    description:
      'The most common allergic skin disease in cats and dogs, caused by hypersensitivity to Ctenocephalides felis salivary antigens. A single flea bite can trigger an intense pruritic response in sensitised animals. Often presents asymmetrically and typically involves the caudal dorsum, tail base, and inner thighs.',
    causes: [
      'IgE-mediated (immediate) and late-phase hypersensitivity to flea saliva antigens',
      'Heavy or intermittent flea exposure — paradoxically, FAD patients often have few fleas visible on examination',
      'Environmental flea contamination — 95 % of flea lifecycle in bedding, carpets, and environment',
      'Concurrent skin conditions (atopy) increase sensitisation risk',
    ],
    symptoms: [
      'Intense pruritus localised to dorsal lumbosacral region, tail base, and caudal abdomen',
      'Alopecia and self-trauma lesions (excoriations, crusts)',
      'Miliary dermatitis pattern in cats (multiple tiny crusted papules)',
      'Skin lesions including papules, pustules, and secondary bacterial infection',
      'Hyperpigmentation in chronic cases',
      'Symmetrical hair loss on the lower back in cats (over-grooming)',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Year-round flea prevention on all in-contact animals (cats AND dogs in the household)',
      'Environmental treatment with IGR (methoprene, pyriproxyfen) to kill larvae and eggs',
      'Monthly prescription-strength flea preventives (isoxazolines, spinosad, selamectin)',
      'Regular vacuuming and laundering of bedding',
    ],
    treatmentMethods: [
      'Rigorous flea control on all animals and in the environment (cornerstone of treatment)',
      'Glucocorticoids (prednisolone) for short-term relief of severe pruritus',
      'Oclacitinib (Apoquel) or lokivetmab (Cytopoint) for dogs as safer long-term alternatives to steroids',
      'Antihistamines (limited efficacy)',
      'Antibiotics for secondary pyoderma',
      'Allergen-specific immunotherapy (ASIT) for long-term desensitisation (uncommonly used for FAD alone)',
    ],
    recoveryPeriod: 'Resolution of pruritus within 4–8 weeks with adequate flea control; recurrence without ongoing prevention',
    symptomNames: ['Pruritus (Itching)', 'Alopecia (Hair Loss)', 'Skin Lesions (Papules/Pustules/Crusts)'],
    treatmentNames: ['Antiparasitic Treatment (Ectoparasites & Endoparasites)', 'Antibiotic Therapy (Systemic)'],
  },
  {
    name: 'Periodontal Disease',
    description:
      'The most common disease in cats and dogs over 3 years of age, affecting >80 % of dogs and 70 % of cats by age 3. Begins as gingivitis (reversible) and progresses to irreversible periodontitis with alveolar bone loss, tooth root destruction, and tooth loss. Bacteraemia from periodontitis has systemic health implications (cardiac, renal).',
    causes: [
      'Accumulation of dental plaque (biofilm of oral bacteria — Porphyromonas, Fusobacterium, Treponema spp.)',
      'Plaque mineralisation into calculus (tartar)',
      'Lack of home dental care (tooth brushing)',
      'Breed and dental conformation (brachycephalic breeds, small breeds with crowded teeth)',
      'Soft diet (reduced mechanical cleaning)',
      'Age — progressive with time',
    ],
    symptoms: [
      'Halitosis (bad breath) — often the first owner-noticed sign',
      'Oral ulcers and stomatitis in advanced cases',
      'Reluctance to chew hard food or toys',
      'Drooling',
      'Pawing at mouth',
      'Red, swollen, bleeding gums',
      'Visible tartar accumulation',
      'Loose or missing teeth',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Daily tooth brushing with pet toothpaste — single most effective preventive',
      'VOHC-approved dental diets, dental chews, and water additives as adjuncts',
      'Annual oral examination under general anaesthesia with dental radiography',
      'Begin dental care in puppies and kittens to establish acceptance',
    ],
    treatmentMethods: [
      'Professional dental scaling and polishing under general anaesthesia',
      'Full-mouth dental radiography to assess bone loss',
      'Extraction of periodontally compromised teeth',
      'Chlorhexidine oral rinse or gel post-procedure',
      'Antibiotics if deep pockets or osteomyelitis present',
      'Home dental care programme initiation at discharge',
    ],
    recoveryPeriod: 'Resolution of gingivitis within 2–4 weeks post-cleaning; advanced periodontitis requires extractions',
    symptomNames: ['Halitosis (Bad Breath)', 'Oral Ulcers/Stomatitis', 'Loss of Appetite'],
    treatmentNames: ['Dental Prophylaxis and Oral Examination Under Anaesthesia'],
  },
  {
    name: 'Toxoplasmosis',
    description:
      'Zoonotic protozoal disease caused by Toxoplasma gondii. Cats are the definitive hosts (only animals shedding oocysts in faeces). Clinical disease is rare in immunocompetent cats and dogs but can cause severe multisystemic disease in immunocompromised animals. Significant zoonotic risk to pregnant women and immunocompromised humans.',
    causes: [
      'Ingestion of oocysts from cat faeces (environment) or tissue cysts in raw/undercooked prey or meat',
      'Tissue cyst ingestion is the primary route for cats and dogs',
      'Transplacental (congenital) transmission',
      'More likely to cause clinical disease in FIV/FeLV positive, immunosuppressed, or neonatal animals',
    ],
    symptoms: [
      'Lethargy and depression',
      'Fever',
      'Loss of appetite',
      'Respiratory distress (pulmonary toxoplasmosis)',
      'Jaundice (hepatic toxoplasmosis)',
      'Uveitis (eye inflammation — common in cats)',
      'Ataxia and seizures (neurological toxoplasmosis)',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Do not feed raw or undercooked meat to cats or dogs',
      'Keep cats indoors to prevent hunting prey animals',
      'Clean litter boxes daily (oocysts require >24 h to become infective)',
      'Pregnant women should avoid litter box cleaning or wear gloves and wash hands thoroughly',
      'Treat water sources — oocysts survive in water',
    ],
    treatmentMethods: [
      'Clindamycin (12.5–25 mg/kg BID, 4 weeks) — drug of choice for cats and dogs',
      'Trimethoprim-sulfadiazine as an alternative',
      'Pyrimethamine + sulfadiazine for refractory cases',
      'Systemic and ophthalmic corticosteroids for uveitis (after confirming active replication treated)',
      'Supportive care: fluids, nutritional support',
    ],
    recoveryPeriod: '2–4 weeks with appropriate antibiotic therapy; neurological signs may be permanent',
    symptomNames: ['Lethargy', 'Fever', 'Loss of Appetite', 'Jaundice (Icterus)', 'Uveitis', 'Ataxia (Loss of Coordination)', 'Seizures (Epilepsy)'],
    treatmentNames: ['Antibiotic Therapy (Systemic)', 'IV Fluid Resuscitation & Supportive Care'],
  },
  {
    name: 'Pyometra',
    description:
      'Life-threatening uterine infection affecting intact female cats and dogs, most commonly occurring 1–8 weeks after the end of oestrus (luteal phase). Progesterone drives uterine gland secretion and reduces myometrial contractions, allowing bacterial proliferation. Emergency surgical intervention (ovariohysterectomy) is the standard treatment.',
    causes: [
      'Bacterial infection (predominantly E. coli) of the progesterone-primed uterus',
      'Cystic endometrial hyperplasia predisposes to infection',
      'Exogenous progesterone or oestrogen administration',
      'Repeated oestrus cycles without pregnancy — risk increases with age',
      'Occurs in intact females >5 years (but can occur at any age)',
    ],
    symptoms: [
      'Vaginal discharge (open cervix — purulent to haemorrhagic)',
      'Lethargy and depression',
      'Loss of appetite',
      'Increased thirst and urination (PU/PD from E. coli endotoxin-induced renal tubular dysfunction)',
      'Vomiting',
      'Abdominal distension (closed cervix cases)',
      'Fever (variable — hypothermia in septic shock)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Ovariohysterectomy (spay) at appropriate age eliminates risk entirely',
      'Avoid exogenous progesterone or oestrogen in intact females',
      'If breeding is intended, ensure regular whelping/queening to prevent cystic endometrial hyperplasia',
      'Annual examination of intact females, especially post-oestrus',
    ],
    treatmentMethods: [
      'Emergency ovariohysterectomy — definitive treatment of choice',
      'Pre-operative stabilisation with IV fluids and antibiotics',
      'Broad-spectrum antibiotics perioperatively (amoxicillin-clavulanate + metronidazole)',
      'Medical management (prostaglandin F2α + aglepristone) in selected young breeding animals — significant risks and recurrence rate',
      'Post-operative monitoring for peritonitis and sepsis',
    ],
    recoveryPeriod: '1–3 weeks post-surgical recovery; medical management requires months',
    symptomNames: ['Vaginal Discharge', 'Lethargy', 'Loss of Appetite', 'Vomiting', 'Abdominal Distension', 'Increased Thirst (Polydipsia)', 'Fever'],
    treatmentNames: ['IV Fluid Resuscitation & Supportive Care', 'Antibiotic Therapy (Systemic)'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting PawSense seed...\n')

  // ── 1. Upsert Symptoms ────────────────────────────────────────────────────
  console.log(`📋 Seeding ${SYMPTOMS.length} symptoms...`)
  const symptomMap = new Map<string, string>() // name → id

  for (const s of SYMPTOMS) {
    const existing = await prisma.symptom.findUnique({ where: { name: s.name } })
    let id: string
    if (existing) {
      await prisma.symptom.update({ where: { id: existing.id }, data: s })
      id = existing.id
      process.stdout.write('  ↺ ')
    } else {
      const created = await prisma.symptom.create({ data: s })
      id = created.id
      process.stdout.write('  ✓ ')
    }
    console.log(s.name)
    symptomMap.set(s.name, id)
  }

  // ── 2. Upsert Treatments ──────────────────────────────────────────────────
  console.log(`\n💊 Seeding ${TREATMENTS.length} treatments...`)
  const treatmentMap = new Map<string, string>() // name → id

  for (const t of TREATMENTS) {
    const { steps, ...treatmentData } = t
    const existing = await prisma.treatment.findUnique({ where: { name: t.name } })
    let id: string

    if (existing) {
      await prisma.treatment.update({ where: { id: existing.id }, data: treatmentData })
      // Replace steps
      await prisma.treatmentStep.deleteMany({ where: { treatmentId: existing.id } })
      id = existing.id
      process.stdout.write('  ↺ ')
    } else {
      const created = await prisma.treatment.create({ data: treatmentData })
      id = created.id
      process.stdout.write('  ✓ ')
    }

    // Create steps
    for (let idx = 0; idx < steps.length; idx++) {
      await prisma.treatmentStep.create({
        data: { treatmentId: id, stepOrder: idx + 1, ...steps[idx]! },
      })
    }

    console.log(t.name)
    treatmentMap.set(t.name, id)
  }

  // ── 3. Upsert Diseases ────────────────────────────────────────────────────
  console.log(`\n🦠 Seeding ${DISEASES.length} diseases...`)

  for (const d of DISEASES) {
    const { symptomNames, treatmentNames, ...diseaseData } = d
    const existing = await prisma.disease.findUnique({ where: { name: d.name } })
    let id: string

    if (existing) {
      await prisma.disease.update({ where: { id: existing.id }, data: diseaseData })
      // Reset links
      await prisma.diseaseSymptom.deleteMany({ where: { diseaseId: existing.id } })
      await prisma.diseaseTreatment.deleteMany({ where: { diseaseId: existing.id } })
      id = existing.id
      process.stdout.write('  ↺ ')
    } else {
      const created = await prisma.disease.create({ data: diseaseData })
      id = created.id
      process.stdout.write('  ✓ ')
    }

    // Link symptoms
    for (const sName of symptomNames) {
      const sId = symptomMap.get(sName)
      if (!sId) { console.warn(`    ⚠  Symptom not found: ${sName}`) ; continue }
      await prisma.diseaseSymptom.upsert({
        where: { diseaseId_symptomId: { diseaseId: id, symptomId: sId } },
        update: {},
        create: { diseaseId: id, symptomId: sId },
      })
    }

    // Link treatments
    for (const tName of treatmentNames) {
      const tId = treatmentMap.get(tName)
      if (!tId) { console.warn(`    ⚠  Treatment not found: ${tName}`) ; continue }
      await prisma.diseaseTreatment.upsert({
        where: { diseaseId_treatmentId: { diseaseId: id, treatmentId: tId } },
        update: {},
        create: { diseaseId: id, treatmentId: tId },
      })
    }

    console.log(d.name)
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const [sc, tc, dc] = await Promise.all([
    prisma.symptom.count(),
    prisma.treatment.count(),
    prisma.disease.count(),
  ])

  console.log('\n✅ Seed complete!')
  console.log(`   Symptoms:   ${sc}`)
  console.log(`   Treatments: ${tc}`)
  console.log(`   Diseases:   ${dc}`)
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e) ; process.exit(1) })
  .finally(() => prisma.$disconnect())