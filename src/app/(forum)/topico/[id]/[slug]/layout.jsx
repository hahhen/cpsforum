import { Topic } from "@/components/data/topic-data"
import { notFound, redirect } from 'next/navigation'

export async function generateMetadata({ params }) {
    // read route params
    const id = params.id;
    const slug = params.slug;
    const topic = Topic.find(topic => topic.id == id);
    const regex = /[^\p{L}\p{N}\s.,!?()-[\]]/giu;
    const filteredBody = topic.text.replace(regex, '');
    const description = filteredBody.substring(0, 300);
    if(!topic){
        notFound();
    }
    if(slug != topic.slug){
        redirect(`${topic.slug}`)
    }
    return {
        title: topic.title + " - Fórum Centro Paula Souza",
        description: description,
    }
}

export default function TopicLayout({ children }) {
    return (
        children
    )
}