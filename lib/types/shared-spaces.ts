export interface SharedSpaceCreatePayload {
    title: string;
    description: string;
    poster: string;
    participants: string[];
    participantsDetail: { _id: string; email: string; photoUrl: string; name: string }[];
    status: string;
    totals: { amount: number; currency: { code: string; symbol: string } }[]
}
