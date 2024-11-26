"use client"

import React from "react";
import { Topic, User } from "@/components/data/topic-data";
import dayjs from "dayjs";
import styled from "styled-components";
import { Separator } from "@/components/ui/separator";
import Markdown from "react-markdown";
import remarkGFM from "remark-gfm";
import { renderMathInElement } from "mathlive";
import mathliveStyle from "mathlive/fonts.css"
import More from "@/components/ui/more";
import { FlagIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import Votecell from "@/components/general/votecell";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";


const TopicTitle = styled.h1`
    font-weight: 600;
    color: var(--foreground);
    font-size: 1.125rem;
    line-height: 1.75rem;
`;

const TopicSubtitle = styled.div`
    color: hsl(var(--muted-foreground));
    font-size: 0.875rem;
    line-height: 1.25rem;
    display: flex;
`;

const Mainbar = styled.div`
    display: grid;
    grid-template-columns: 1fr 13fr;
`

export default function TopicView({ params }) {
    const id = params.id;
    const [author, setAuthor] = React.useState()

    const { isPending: isTopicPending, error: errorTopic, data: topic } = useQuery({
        queryKey: ['topic'],
        queryFn: () =>
            fetch(`${process.env.NEXT_PUBLIC_HOSTNAME}/api/topico/${id}`).then((res) => 
                res.json()
            )
    })

    React.useEffect(() => {
        renderMathInElement("mainbar");
        setAuthor(topic.topic.user);
    }, [topic]);

    return (
        <div className="py-4">
            
            <div className="flex">
                {!isTopicPending ?
                    <div>
                        <TopicTitle>
                            {topic.topic.title}
                        </TopicTitle>
                        <TopicSubtitle>
                            <div className="me-4">
                                <span>Postado&nbsp;</span>
                                <span className="font-medium" title={topic.topic.createdAt}>{dayjs(topic.topic.createdAt).fromNow()}</span>
                            </div>
                            
                            {/* <div className="me-4">
                                <span>Visto&nbsp;</span>
                                <span className="font-medium">{topic.topic.views}&nbsp;vezes</span>
                            </div>  */}
                           
                        </TopicSubtitle>
                    </div>
                    :
                    <div className="flex flex-col gap-2">
                        <Skeleton className={"h-6 w-64"} />
                        <Skeleton className={"h-4 w-64"} />
                    </div>
                }
                <div className="ml-auto">
                    <More>
                        <div className="flex gap-2">
                            <PencilIcon size={15} />
                            <Label>Editar</Label>
                        </div>
                        <div className="flex gap-2">
                            <FlagIcon size={15} />
                            <Label>Reportar</Label>
                        </div>
                        <div className="flex gap-2">
                            <Trash2Icon size={15} />
                            <Label>Excluir</Label>
                        </div>
                    </More>
                </div>
            </div>
            <Separator className={"my-4"} />
            <Mainbar id="mainbar">
                <Votecell votesAmount={topic?.votes || 0} />
                {topic ?
                    <Markdown remarkPlugins={[remarkGFM]} className="prose foreground prose-sm max-w-none dark:prose-invert">
                        {topic.topic.body}
                    </Markdown>
                    :
                    <Skeleton className={"h-64 w-full"} />
                }
            </Mainbar>
            <Separator className={"my-4"} />
            <div className="flex">
                <div className="text-xs flex flex-col text-muted-foreground ml-auto">
                    <span>Postado por&nbsp;</span>
                    {author ?
                        <Link href={`/perfil/${author.id}/${author.slug}`} className="font-medium py-1 flex text-primary-foreground gap-1">
                            <Avatar className="rounded-md">
                                <AvatarImage src={author?.pic} />
                                <AvatarFallback className="rounded-md">
                                    {author?.firstName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground">{author.firstName}&nbsp;{author.lastName}</span>
                        </Link>
                        :
                        <div className="flex items-start gap-1">
                            <Skeleton className="h-12 w-12 rounded-md" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}