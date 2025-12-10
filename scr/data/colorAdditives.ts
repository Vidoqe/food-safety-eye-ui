// scr/data/colorAdditives.ts

export type RiskLevel = 'low' | 'moderate' | 'moderate_high' | 'high';
export type ChildRiskLevel = 'ok' | 'limit' | 'avoid';
export type BadgeColor = 'green' | 'yellow' | 'red';

export interface ColorAdditiveInfo {
  key: string; // canonical key, e.g. "red 40"
  ins?: string;
  e_number?: string;
  category: 'coloring';
  common_name: string;
  alt_names: string[];
  risk_level: RiskLevel;
  child_risk: ChildRiskLevel;
  badge_color: BadgeColor;
  taiwan_rule: string;
  fda_rule: string;
  description: string;
  match_terms: string[];
}

// Master list (dev – can expand later)
export const COLOR_ADDITIVES: ColorAdditiveInfo[] = [
  {
    key: 'red 40',
    ins: '129',
    e_number: 'E129',
    category: 'coloring',
    common_name: 'Allura Red AC (Red 40)',
    alt_names: ['red 40', 'fd&c red no. 40', 'allura red ac'],
    risk_level: 'high',
    child_risk: 'avoid',
    badge_color: 'red',
    taiwan_rule:
      'Synthetic colour permitted with limits under Taiwan food additive standards; counted among approved synthetic colourants.',
    fda_rule:
      'Certified colour additive allowed in foods, drugs, and cosmetics; subject to batch certification. Included in recent plans to phase out petroleum-based synthetic dyes from the US food supply.',
    description:
      'Petroleum-derived azo dye used in sweets, drinks and processed foods. Linked in studies to increased hyperactivity in children; provides no nutritional value.',
    match_terms: ['red 40', 'fd&c red 40', 'fd&c red no. 40', 'allura red', 'allura red ac', 'e129', 'ins 129']
  },
  {
    key: 'yellow 5',
    ins: '102',
    e_number: 'E102',
    category: 'coloring',
    common_name: 'Tartrazine (Yellow 5)',
    alt_names: ['yellow 5', 'fd&c yellow no. 5', 'tartrazine'],
    risk_level: 'high',
    child_risk: 'avoid',
    badge_color: 'red',
    taiwan_rule: 'Synthetic colour permitted with limits under Taiwan food additive standards.',
    fda_rule:
      'Certified colour additive allowed in foods and drugs. In the EU/UK, products containing E102 require a label warning about possible adverse effects on activity and attention in children.',
    description:
      'Azo dye used in soft drinks, candies and snacks. Associated with allergic reactions in sensitive people and hyperactivity concerns in children.',
    match_terms: ['yellow 5', 'fd&c yellow 5', 'fd&c yellow no. 5', 'tartrazine', 'e102', 'ins 102']
  },
  {
    key: 'yellow 6',
    ins: '110',
    e_number: 'E110',
    category: 'coloring',
    common_name: 'Sunset Yellow FCF (Yellow 6)',
    alt_names: ['yellow 6', 'fd&c yellow no. 6', 'sunset yellow fcf'],
    risk_level: 'high',
    child_risk: 'avoid',
    badge_color: 'red',
    taiwan_rule: 'Synthetic colour permitted with limits under Taiwan food additive standards.',
    fda_rule:
      'Certified colour additive for food and beverages. Products with E110 in the EU/UK must carry a hyperactivity warning label for children.',
    description:
      'Orange azo dye used in soft drinks, desserts and flavoured snacks. Part of dye mixtures linked to increased hyperactivity in children.',
    match_terms: ['yellow 6', 'fd&c yellow 6', 'fd&c yellow no. 6', 'sunset yellow', 'sunset yellow fcf', 'e110', 'ins 110']
  },
  {
    key: 'ponceau 4r',
    ins: '124',
    e_number: 'E124',
    category: 'coloring',
    common_name: 'Ponceau 4R',
    alt_names: ['ponceau 4r', 'cochineal red a'],
    risk_level: 'high',
    child_risk: 'avoid',
    badge_color: 'red',
    taiwan_rule: 'Synthetic red colour permitted with limits under Taiwan additive rules.',
    fda_rule:
      'Not approved for use in US foods but used in many other markets with an ADI and child-behaviour warning requirements in the EU/UK.',
    description:
      'Synthetic red azo dye used in drinks, confectionery and processed foods. Included in the “Southampton colours” linked to behaviour changes in children.',
    match_terms: ['ponceau 4r', 'e124', 'ins 124', 'cochineal red a']
  },
  {
    key: 'carmoisine',
    ins: '122',
    e_number: 'E122',
    category: 'coloring',
    common_name: 'Carmoisine',
    alt_names: ['carmoisine', 'azorubine'],
    risk_level: 'high',
    child_risk: 'avoid',
    badge_color: 'red',
    taiwan_rule: 'Synthetic red colour permitted with limits in specified food categories.',
    fda_rule:
      'Not approved for food use in the US; used in EU and other markets with ADI and hyperactivity warning label requirements.',
    description:
      'Red azo dye used in drinks, desserts and processed foods. Often used together with other artificial colours associated with hyperactivity in children.',
    match_terms: ['carmoisine', 'azorubine', 'e122', 'ins 122']
  },
  {
    key: 'quinoline yellow',
    ins: '104',
    e_number: 'E104',
    category: 'coloring',
    common_name: 'Quinoline Yellow',
    alt_names: ['quinoline yellow', 'quinoline yellow ws'],
    risk_level: 'high',
    child_risk: 'avoid',
    badge_color: 'red',
    taiwan_rule: 'Synthetic yellow colour permitted with limits under Taiwan standards.',
    fda_rule:
      'Not permitted for use in US foods; authorised in the EU with an ADI and hyperactivity warning label requirements.',
    description:
      'Synthetic yellow dye used in candies, beverages and desserts. One of the artificial colours linked to adverse effects on activity and attention in children.',
    match_terms: ['quinoline yellow', 'e104', 'ins 104']
  },
  {
    key: 'blue 1',
    ins: '133',
    e_number: 'E133',
    category: 'coloring',
    common_name: 'Brilliant Blue FCF (Blue 1)',
    alt_names: ['blue 1', 'fd&c blue no. 1', 'brilliant blue fcf'],
    risk_level: 'moderate',
    child_risk: 'limit',
    badge_color: 'yellow',
    taiwan_rule:
      'Approved synthetic blue colour within Taiwan’s list of permitted synthetic colourants and maximum-use levels.',
    fda_rule:
      'Certified colour additive allowed in foods, drugs and cosmetics; considered of low toxicity at typical intakes but targeted in broader moves away from petroleum-based dyes.',
    description:
      'Petroleum-based blue dye widely used in candies, drinks and processed foods. Low acute toxicity but no nutritional benefit.',
    match_terms: ['blue 1', 'fd&c blue 1', 'fd&c blue no. 1', 'brilliant blue', 'brilliant blue fcf', 'e133', 'ins 133']
  },
  {
    key: 'blue 2',
    ins: '132',
    e_number: 'E132',
    category: 'coloring',
    common_name: 'Indigo Carmine (Blue 2)',
    alt_names: ['blue 2', 'fd&c blue no. 2', 'indigo carmine', 'indigotine'],
    risk_level: 'moderate',
    child_risk: 'limit',
    badge_color: 'yellow',
    taiwan_rule: 'Approved synthetic blue colour with limits under Taiwan additive standards.',
    fda_rule:
      'Certified colour additive allowed in US foods; EFSA and JECFA maintain an ADI based on toxicity data.',
    description:
      'Indigoid synthetic dye used in sweets and beverages. Rare allergic reactions reported; part of the general push to reduce synthetic dyes in processed foods.',
    match_terms: ['blue 2', 'fd&c blue 2', 'fd&c blue no. 2', 'indigo carmine', 'indigotine', 'e132', 'ins 132']
  },
  {
    key: 'green 3',
    ins: '143',
    e_number: 'E143',
    category: 'coloring',
    common_name: 'Fast Green FCF (Green 3)',
    alt_names: ['green 3', 'fd&c green no. 3', 'fast green fcf'],
    risk_level: 'moderate',
    child_risk: 'limit',
    badge_color: 'yellow',
    taiwan_rule: 'Listed among synthetic colourants approved with restrictions on use levels.',
    fda_rule:
      'Certified colour additive allowed in US foods but used less commonly; part of broader efforts to reduce petroleum-based dyes.',
    description:
      'Synthetic green dye with relatively low toxicity in animal studies but still a non-nutritive, petroleum-based additive.',
    match_terms: ['green 3', 'fd&c green 3', 'fd&c green no. 3', 'fast green', 'fast green fcf', 'e143', 'ins 143']
  },
  {
    key: 'red 3',
    ins: '127',
    e_number: 'E127',
    category: 'coloring',
    common_name: 'Erythrosine (Red 3)',
    alt_names: ['red 3', 'erythrosine', 'fd&c red no. 3'],
    risk_level: 'high',
    child_risk: 'avoid',
    badge_color: 'red',
    taiwan_rule: 'Approved as a synthetic colour with limits; use is more restricted than for some other colours.',
    fda_rule:
      'Recently banned in US foods and dietary supplements with a phase-out period; still allowed in some drug and cosmetic uses but under review.',
    description:
      'Iodine-containing red dye formerly used in cherries, candies and baked goods. Animal studies linked it to thyroid tumours, leading to bans in several countries.',
    match_terms: ['red 3', 'fd&c red 3', 'fd&c red no. 3', 'erythrosine', 'e127', 'ins 127']
  },
  {
    key: 'caramel color (class iv)',
    ins: '150d',
    e_number: 'E150d',
    category: 'coloring',
    common_name: 'Caramel Color Class IV (Sulphite Ammonia Caramel)',
    alt_names: ['caramel color', 'caramel colour', 'class iv caramel', 'e150d'],
    risk_level: 'moderate_high',
    child_risk: 'limit',
    badge_color: 'yellow',
    taiwan_rule:
      'Caramel colours are widely permitted under Taiwan standards with maximum levels for different food categories.',
    fda_rule:
      'Caramel colour is an approved colour additive exempt from certification; concerns focus on 4-MEI formed in some Class III/IV caramels.',
    description:
      'Brown colouring used heavily in colas and dark sauces. Overall considered safe at typical intakes, but some Class III/IV caramels can contain 4-MEI, a process contaminant raising cancer concerns at high doses in animals.',
    match_terms: ['caramel color', 'caramel colour', 'colour (e150d)', 'color (e150d)', 'e150d', 'ins 150d']
  },
  {
    key: 'artificial color (unspecified)',
    category: 'coloring',
    common_name: 'Artificial colour (unspecified)',
    alt_names: ['artificial color', 'artificial colours', 'artificial colour', 'artificial colours added'],
    risk_level: 'high',
    child_risk: 'avoid',
    badge_color: 'red',
    taiwan_rule:
      'Indicates presence of one or more synthetic colours; actual risk depends on which dyes and amounts are used.',
    fda_rule:
      'Label term does not specify which certified dyes are used; overall risk depends on underlying dyes but many artificial colours are under renewed scrutiny.',
    description:
      'Generic label term signalling synthetic colourants without identifying which ones. Treated as high risk in this app, especially for children, due to uncertainty.',
    match_terms: ['artificial color', 'artificial colours', 'artificial colour', 'artificial colors']
  },
  {
    key: 'food coloring (generic)',
    category: 'coloring',
    common_name: 'Food colouring (generic)',
    alt_names: ['food coloring', 'food colouring', 'colour added', 'color added'],
    risk_level: 'moderate',
    child_risk: 'limit',
    badge_color: 'yellow',
    taiwan_rule:
      'Generic label that may include natural or synthetic colours; Taiwan additive rules require approved substances and limits.',
    fda_rule:
      'Generic wording that could include certified synthetic colours or colours exempt from certification. Risk depends on actual dyes used.',
    description:
      'Vague term indicating that colourants are present but not named. In this app treated as medium risk and “limit” for children unless specific safer colours are also declared.',
    match_terms: ['food coloring', 'food colouring', 'colour added', 'color added']
  },
  {
    key: 'beta-carotene',
    ins: '160a',
    e_number: 'E160a',
    category: 'coloring',
    common_name: 'Carotenes / Beta-carotene',
    alt_names: ['beta-carotene', 'carotenes'],
    risk_level: 'low',
    child_risk: 'ok',
    badge_color: 'green',
    taiwan_rule:
      'Approved colour derived from carotenes (natural or synthetic) among the natural-colour list; subject to use limits by food category.',
    fda_rule:
      'Approved as a colour additive, often exempt from certification when from natural sources. Also functions as a precursor to vitamin A.',
    description:
      'Yellow–orange pigment from carrots and other plants. Widely considered safe at food-use levels; safety concerns apply mainly to very high supplemental doses in adults, not normal colouring use.',
    match_terms: ['beta-carotene', 'carotenes', 'colour: carotenes', 'color: carotenes', 'e160a', 'ins 160a']
  },
  {
    key: 'paprika extract',
    ins: '160c',
    e_number: 'E160c',
    category: 'coloring',
    common_name: 'Paprika extract / Paprika oleoresin',
    alt_names: ['paprika extract', 'paprika oleoresin', 'capsanthin', 'capsorubin'],
    risk_level: 'low',
    child_risk: 'ok',
    badge_color: 'green',
    taiwan_rule:
      'Natural colour from paprika included among permitted natural food colourants, with limits depending on food type.',
    fda_rule:
      'Listed as a colour additive exempt from certification and considered safe at typical dietary exposures.',
    description:
      'Natural red–orange colour extracted from paprika peppers. Provides colour and some flavour; safety evaluations show no health concern at approved levels.',
    match_terms: ['paprika extract', 'paprika oleoresin', 'colour (paprika)', 'color (paprika)', 'e160c', 'ins 160c']
  },
  {
    key: 'beetroot red',
    ins: '162',
    e_number: 'E162',
    category: 'coloring',
    common_name: 'Beetroot red / Betanin',
    alt_names: ['beetroot red', 'betanin'],
    risk_level: 'low',
    child_risk: 'ok',
    badge_color: 'green',
    taiwan_rule:
      'Beet-derived natural colour permitted within the list of natural food colourants; limited by good manufacturing practice and food category.',
    fda_rule:
      'Beet juice and beet-derived colours are colour additives exempt from certification and considered safe at food-use levels.',
    description:
      'Red pigment extracted from beetroot. Evaluations by authorities report no safety concern at current use levels in foods.',
    match_terms: ['beetroot red', 'beet juice colour', 'beet juice color', 'betanin', 'e162', 'ins 162']
  }
];

// Optional: convenient lookup by key
export const COLOR_ADDITIVES_BY_KEY: Record<string, ColorAdditiveInfo> = Object.fromEntries(
  COLOR_ADDITIVES.map((item) => [item.key, item])
);
