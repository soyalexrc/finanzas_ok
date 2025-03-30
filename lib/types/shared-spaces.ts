import {Timestamp} from "@firebase/firestore";

export interface SharedSpaceCreatePayload {
    title: string;
    description: string;
    poster: string;
    participants: string[];
    participantsDetail: { id: string; email: string; photoUrl: string; name: string, pushToken: string }[];
    status: string;
    created: Date;
    authorId: string;
    totals: { amount: number; currency: { code: string; symbol: string } }[]
}
