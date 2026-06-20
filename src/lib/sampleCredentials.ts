import type { CredentialType } from '@/types'

export interface SampleCredential {
  type: CredentialType
  title: string
  institution: string
  description: string
  startDate: string
  endDate: string
  current: boolean
}

// Realistic sample data used by the admin "Generate test credential" tool.
// This exists purely to speed up demo/testing — every generated credential
// is clearly attributed to the admin account, never presented as a real user.
const SAMPLES: SampleCredential[] = [
  { type:'education', title:'BSc Computer Science', institution:'University of Lagos',
    description:'Graduated with second class upper honours, focus on software engineering and distributed systems.',
    startDate:'2017-09', endDate:'2021-07', current:false },
  { type:'education', title:'MSc Data Science', institution:'University of Ibadan',
    description:'Specialised in machine learning and statistical modelling.',
    startDate:'2021-09', endDate:'2023-06', current:false },
  { type:'work', title:'Senior Software Engineer', institution:'Andela',
    description:'Led a team of 4 engineers building fintech infrastructure for African markets.',
    startDate:'2021-08', endDate:'', current:true },
  { type:'work', title:'Backend Developer', institution:'Paystack',
    description:'Built and maintained payment processing APIs handling millions of transactions monthly.',
    startDate:'2019-03', endDate:'2021-07', current:false },
  { type:'certification', title:'AWS Certified Solutions Architect', institution:'Amazon Web Services',
    description:'Professional level certification covering cloud architecture and infrastructure design.',
    startDate:'2022-04', endDate:'2025-04', current:false },
  { type:'certification', title:'Certified Kubernetes Administrator', institution:'Cloud Native Computing Foundation',
    description:'Hands-on certification covering cluster administration and container orchestration.',
    startDate:'2023-01', endDate:'2026-01', current:false },
  { type:'project', title:'Decentralized Credential Platform', institution:'Personal Project',
    description:'Built a full-stack Web3 application combining Shelby storage with GenLayer AI verification.',
    startDate:'2025-06', endDate:'', current:true },
  { type:'project', title:'Open Source Payment Gateway', institution:'GitHub Community',
    description:'Contributed core transaction reconciliation logic to a widely-used open source project.',
    startDate:'2022-01', endDate:'2022-09', current:false },
  { type:'skill', title:'Smart Contract Development', institution:'Self-taught',
    description:'Proficient in Solidity, Move, and Python-based smart contract frameworks.',
    startDate:'2021-01', endDate:'', current:true },
  { type:'skill', title:'System Design', institution:'Self-taught',
    description:'Experienced designing scalable distributed systems handling high-throughput workloads.',
    startDate:'2020-01', endDate:'', current:true },
  { type:'award', title:'Best Hackathon Project', institution:'ETHLagos',
    description:'Won first place for building a decentralized identity verification tool.',
    startDate:'2024-11', endDate:'2024-11', current:false },
  { type:'award', title:'Employee of the Year', institution:'Andela',
    description:'Recognised for outstanding technical leadership and mentorship.',
    startDate:'2023-12', endDate:'2023-12', current:false },
]

export function getRandomSample(): SampleCredential {
  return SAMPLES[Math.floor(Math.random() * SAMPLES.length)]
}
