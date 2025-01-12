export interface TeamMember {
  name: string;
  email: string;
  role: 'Leader' | 'Analyst' | 'Trader' | 'Risk Manager';
}

export interface Team {
  teamName: string;
  teamCode: string;
  members: TeamMember[];
}