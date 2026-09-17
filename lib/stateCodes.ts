export interface StateMapping {
  name: string;
  code: string;
  districts?: string[];
}

export const INDIAN_STATES: StateMapping[] = [
  {
    name: "Maharashtra",
    code: "MH",
    districts: ["Nagpur", "Mumbai", "Pune", "Nashik", "Thane", "Aurangabad (Chhatrapati Sambhajinagar)", "Amravati", "Kolhapur", "Solapur"]
  },
  {
    name: "Gujarat",
    code: "GJ",
    districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"]
  },
  {
    name: "Madhya Pradesh",
    code: "MP",
    districts: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa"]
  },
  {
    name: "Karnataka",
    code: "KA",
    districts: ["Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi"]
  },
  {
    name: "Telangana",
    code: "TS",
    districts: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"]
  },
  {
    name: "Andhra Pradesh",
    code: "AP",
    districts: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"]
  },
  {
    name: "Delhi",
    code: "DL",
    districts: ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "New Delhi"]
  },
  {
    name: "Rajasthan",
    code: "RJ",
    districts: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"]
  },
  {
    name: "Uttar Pradesh",
    code: "UP",
    districts: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Noida", "Ghaziabad"]
  },
  {
    name: "West Bengal",
    code: "WB",
    districts: ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol"]
  },
  {
    name: "Tamil Nadu",
    code: "TN",
    districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"]
  },
  {
    name: "Kerala",
    code: "KL",
    districts: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"]
  },
  {
    name: "Goa",
    code: "GA",
    districts: ["North Goa", "South Goa"]
  },
  {
    name: "Punjab",
    code: "PB",
    districts: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"]
  },
  {
    name: "Haryana",
    code: "HR",
    districts: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar"]
  },
  {
    name: "Bihar",
    code: "BR",
    districts: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"]
  },
  {
    name: "Odisha",
    code: "OD",
    districts: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"]
  },
  {
    name: "Jharkhand",
    code: "JH",
    districts: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"]
  },
  {
    name: "Chhattisgarh",
    code: "CG",
    districts: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"]
  },
  {
    name: "Assam",
    code: "AS",
    districts: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"]
  },
  {
    name: "Uttarakhand",
    code: "UK",
    districts: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Nainital"]
  },
  {
    name: "Himachal Pradesh",
    code: "HP",
    districts: ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu"]
  },
  {
    name: "Jammu and Kashmir",
    code: "JK",
    districts: ["Srinagar", "Jammu", "Anantnag", "Baramulla"]
  },
  {
    name: "Chandigarh",
    code: "CH",
    districts: ["Chandigarh"]
  }
];

export function getStateCode(stateName: string): string {
  if (!stateName) return "GG";
  const found = INDIAN_STATES.find(
    s => s.name.toLowerCase().trim() === stateName.toLowerCase().trim() ||
         s.code.toLowerCase().trim() === stateName.toLowerCase().trim()
  );
  return found ? found.code : "GG";
}

export function getDistrictsForState(stateName: string): string[] {
  const found = INDIAN_STATES.find(
    s => s.name.toLowerCase().trim() === stateName.toLowerCase().trim() ||
         s.code.toLowerCase().trim() === stateName.toLowerCase().trim()
  );
  return found?.districts || ["General / Other"];
}
