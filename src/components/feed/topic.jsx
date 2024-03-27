import { dayjs } from "@/components/data/dayjs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const Topic = ({ item }) => {
    const regex = /[^\p{L}\p{N}\s.,!?()-[\]]/giu;
    const filteredBody = item.text.replace(regex, '');
    return (
        <div            
            key={item.id}
            className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent"
            )}
        >
            <div className="flex w-full flex-col gap-1">
                <Link 
                href={`/topico/${item.id}/${item.slug}`}
                className="flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="font-semibold">{item.title}</div>
                        {!item.read && (
                            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                        )}
                    </div>
                    <div
                        title={item.date}
                        className={cn(
                            "text-muted-foreground ml-auto text-xs",
                        )}
                    >
                        {dayjs(item.date).fromNow()}
                    </div>
                </Link>
                {/* PLACEHOLDER */}
                <Link href={`/perfil/${item.name}`} className="text-xs font-medium">{item.name}</Link>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
                {filteredBody.substring(0, 300)}
            </div>
            {item.labels.length ? (
                <div className="flex items-center gap-2">
                    {item.labels.map((label, i) => (
                        //PLACEHOLDER
                        <Badge key={i} variant={getBadgeVariantFromLabel(label)}>
                            <Link href={`/tag/${label}`}>
                                {label}
                            </Link>
                        </Badge>

                    ))}
                </div>
            ) : null
            }
        </div >
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