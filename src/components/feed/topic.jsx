'use client'

import { dayjs } from "@/components/data/dayjs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const Topic = ({ item }) => {
    const regex = /[^\p{L}\p{N}\s.,!?()-[\]]/giu;
    const filteredBody = item.body.replace(regex, '');
    const author = item.user;
    return (
        <div className="relative transition-all hover:bg-accent">
            <div
                key={item.id}
                className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3 text-left"
                )}
            >
                <div className="flex w-full flex-col gap-1">
                    <div
                        href={`/topico/${item.id}/${item.slug}`}
                        className="flex items-center">
                        <div className="flex items-center gap-2">
                            <div className="font-semibold">{item.title}</div>
                            {/* {!item.read && (
                            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                        )} */}
                        </div>
                        <div
                            title={item.createdAt}
                            className={cn(
                                "text-muted-foreground ml-auto text-xs",
                            )}
                        >
                            {dayjs(item.createdAt).fromNow()}
                        </div>
                    </div>
                    <Link href={`/perfil/${author.id}/${author.slug}`} className="z-10 text-xs font-medium hover:text-muted-foreground w-fit">{author.name}</Link>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                    {filteredBody.substring(0, 300)}
                </div>
                {item.tag ? (
                    <div className="flex items-center gap-2">
                        {[item.tag].map((label, i) => (
                            //PLACEHOLDER
                            <Badge key={i} variant={getBadgeVariantFromLabel(label)}>
                                <Link className="z-10 hover:text-muted-foreground text-xs" href={`/tag/${label}`}>
                                    {label}
                                </Link>
                            </Badge>

                        ))}
                    </div>
                ) : null
                }
            </div >
            <Link className="absolute top-0 right-0 bottom-0 left-0 z-0" href={`/topico/${item.id}/${item.slug}`}></Link>
        </div>
    )
}

function getBadgeVariantFromLabel(label) {
    if (["work"].includes(label.toLowerCase())) {
        return "default"
    }

    if (["personal"].includes(label.toLowerCase())) {
        return "outline"
    }

    return "secondary"
}