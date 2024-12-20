'use client'
import React, { useState, useRef } from 'react';
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
} from '@/components/ui/form';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import styled from 'styled-components';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { sectionlinks } from '@/components/data/section-data';
import Editor from '@/components/editor/editor';
import { toast } from 'sonner';
import Footer from '@/components/footer/footer';
import { XIcon, CheckCircle } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { tags } from '@/components/data/tags';

const Main = styled.main`
    padding: 2rem 1rem 2rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
`;
import { redirect } from 'next/navigation';


export const CommandDemo = ({ onTagClick, step }) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [inputValue, setInputValue] = useState('');

    const inputRef = useRef(null);

    const getVisibleTags = () => {
        const searchTerm = inputValue.toLowerCase();
        return tags.flatMap(group => group.tags).filter(tag => tag.toLowerCase().includes(searchTerm));
    };

    const handleKeyDown = (event) => {
        const visibleTags = getVisibleTags();

        if (event.key === 'ArrowDown') {
            setSelectedIndex((prevIndex) => {
                if (visibleTags.length === 0) return -1;
                return Math.min(prevIndex + 1, visibleTags.length - 1);
            });
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, -1));
            event.preventDefault();
        } else if (event.key === 'Enter' && selectedIndex >= 0) {
            const selectedTag = getVisibleTags()[selectedIndex];
            if (selectedTag) {
                onTagClick(selectedTag);
                setInputValue(''); // Limpa o input após a seleção
                setSelectedIndex(-1); // Reseta a seleção
            }
            event.preventDefault();
        }
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        setSelectedIndex(-1); // Reseta a seleção ao digitar
    };

    return (
        <Command className="rounded-lg border shadow-md" onKeyDown={handleKeyDown}>
            <div className="flex items-center border-b px-3">
                <input
                    ref={inputRef}
                    placeholder="Escreva sua tag ou pesquise"
                    className={`flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground ${step >= 4 ? '' : 'cursor-not-allowed opacity-50'}`}
                    onChange={handleInputChange}
                    onFocus={() => setSelectedIndex(-1)} // Reseta seleção ao focar
                />
            </div>
            <CommandList>
                <CommandEmpty>Sem resultados.</CommandEmpty>
                {tags.map((tagGroup, groupIndex) => (
                    <CommandGroup key={groupIndex} heading={tagGroup.title}>
                        {tagGroup.tags.map((tag, tagIndex) => {
                            const visibleTags = getVisibleTags();
                            const isVisible = visibleTags.includes(tag);
                            const index = visibleTags.indexOf(tag);
                            const isSelected = selectedIndex === index;

                            if (isVisible) {
                                return (
                                    <CommandItem
                                        key={tagIndex}
                                        className={`${step >= 4 ? '' : 'cursor-not-allowed opacity-50'} ${isSelected ? 'bg-accent' : ''}`}
                                        onMouseEnter={() => setSelectedIndex(index)} // Destaque ao passar o mouse
                                        onClick={() => { if (step >= 4) onTagClick(tag); }}
                                    >
                                        {tag}
                                    </CommandItem>
                                );
                            }
                            return null; // Não renderiza se não estiver visível
                        })}
                    </CommandGroup>
                ))}
            </CommandList>
        </Command>
    );
};


export const TitleErrorMessage = ({ text }) => {
    const trimmedText = text.trim();
    if (trimmedText.length >= 15) {
        return (
            <p className='text-sm font-medium text-primary flex mb-2 mt-2'>
                Parece bom!<CheckCircle className='ml-2 w-5 h-5' />
            </p>
        );
    }
    return (
        <p className='text-sm font-medium text-destructive'>
            São necessários mais {15 - trimmedText.length} caracteres no seu título.
        </p>
    );
}

export default function Criar() {
    //State para etapas
    const [step, setStep] = React.useState(1);
    const [tags, setTags] = React.useState([]);
    const [inputTag, setInputTag] = React.useState('');

    const [title, setTitle] = React.useState('');
    const [isClicked, setIsClicked] = React.useState(false);

    const validateTitle = (text) => {
        if (text.trim().length >= 10) {
            return '';
        }
        return "input-disabled cursor-not-allowed opacity-50";
    }

    const handleInputTitle = (e) => {
        setTitle(e.target.value)
        validateTitle(e.target.value)
    }

    const handleInputTag = (tag, isEnter) => {
        setInputTag(tag)
        if (isEnter) {
            handleTags(tag)
        }
    }

    const handleInputClick = () => {
        setIsClicked(true);
    }

    //Schema para o form
    const formSchema = z.object({
        title: z.string({ required_error: "O titulo do tópico é necessário." })
            .min(0, {
                message: "O título deve ter no mínimo 15 caracteres.",
            })
            .max(150, {
                message: "O título deve ter no máximo 150 caracteres.",
            }),
        privacy: z.coerce.number({
            required_error: "Selecione a privacidade do tópico."
        }),
        section: z.string({
            required_error: "Selecione uma seção."
        }),
        body: z.string({
            required_error: "O corpo do tópico é obrigatório."
        }).min(20, {
            message: "O corpo do tópico deve ter no mínimo 20 caracteres.",
        })
    });

    const editorAutoSavedValue = typeof window !== "undefined" ? window.localStorage.getItem('editor-auto-saved-content') || '' : '';

    //Hook do form
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            privacy: 0,
            body: editorAutoSavedValue,
        }
    });

    // onSubmit
    async function onSubmit(values) {
        values.tags = tags;

        const { title, privacy, section, body } = values;

        const requestBody = {
            // userId: session.data?.user?.userId,
            userId: 4,
            title: title,
            privacy: privacy,
            section: section,
            body: body,
            tag: "Apresentação TCC"
        }

        const req = await fetch('/api/criar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        console.log(JSON.stringify(requestBody));

        const res = await req.json();

        if (res.success){
            toast.success('Tópico criado com sucesso!', JSON.stringify(res.message));
        }else{
            toast.error('Erro ao criar tópico.');
        }

        // toast.success(JSON.stringify(requestBody));
        localStorage.clear();
    }

    // Adicionar tag quando um span é clicado
    const handleTags = (tag) => {
        if (tag.trim() !== '' && !tags.includes(tag) && tags.length < 6) {
            setTags([...tags, tag.trim()]);
        }
        setInputTag("")
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = tags.filter(tag => tag !== tagToRemove);
        setTags(updatedTags);
    };

    return (
        <Main>
            <div className='w-full max-w-[1000px]'>
                <h2 className="scroll-m-20 pb-5 self-start font-medium text-3xl tracking-tight first:mt-0">
                    Criar tópico
                </h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                            name="title"
                            render={({ field }) => (
                                <FormItem className={`p-4 bg-muted rounded-md border`}>
                                    <FormLabel>Título</FormLabel>
                                    <FormDescription className="!mt-0">
                                        Seja conciso e tente resumir seu tópico em uma linha.
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            placeholder="Como resolver essa equação?"
                                            value={title}
                                            onChange={
                                                (e) => {
                                                    handleInputTitle(e)
                                                    field.onChange(e)
                                                }
                                            }
                                            onClick={() => handleInputClick()}
                                        />
                                    </FormControl>
                                    {isClicked ? <TitleErrorMessage text={title} /> : ''}

                                    {step == 1 ?
                                        <Button
                                            className={`${validateTitle(title)}`}
                                            size={"sm"}
                                            onClick={() => setStep(step + 1)}
                                            type="button"
                                            id={"next"}>
                                            Próximo
                                        </Button>
                                        : null}
                                </FormItem>
                            )}
                        />


                        <FormField

                            name="privacy"
                            render={({ field }) => (
                                <FormItem className={`p-4 bg-muted rounded-md border ${step >= 2 ? null : "cursor-not-allowed opacity-50"}`}>
                                    <FormLabel>Privacidade</FormLabel>
                                    <FormDescription className="!mt-0">
                                        Selecione a visibilidade de seu tópico.
                                    </FormDescription>
                                    <FormControl>
                                        <Select disabled={step >= 2 ? false : true} onValueChange={field.onChange} defaultValue={field.value.toString()} className="overflow-auto">
                                            <SelectTrigger className="w-[300px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Público</SelectItem>
                                                <SelectItem value="2">Minha instituição</SelectItem>
                                                <SelectItem value="1">Privado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                    {step == 2 ? <Button size={"sm"} onClick={() => setStep(step + 1)} type="button" id={"next"}>Próximo</Button> : null}
                                </FormItem>
                            )}
                        />

                        <FormField

                            name="section"
                            render={({ field }) => (
                                <FormItem className={`p-4 rounded-md bg-muted border ${step >= 3 ? null : "cursor-not-allowed opacity-50"}`}>
                                    <FormLabel>Seção</FormLabel>
                                    <FormDescription className="!mt-0">
                                        Selecione em qual seção seu tópico será postado.
                                    </FormDescription>
                                    <FormControl>
                                        <Select disabled={step >= 3 ? false : true} className="overflow-auto" onValueChange={field.onChange} defaultValue={field.value} >
                                            <SelectTrigger className="w-[300px]">
                                                <SelectValue placeholder="Selecione a seção" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sectionlinks.slice(1).map((supersection, i) =>
                                                    <SelectGroup key={i}>
                                                        <SelectLabel>{supersection.title}</SelectLabel>
                                                        {supersection.sections.map((section, si) =>
                                                            <SelectItem className="cursor-pointer" key={si} value={section.slug}>{section.title}</SelectItem>
                                                        )}
                                                    </SelectGroup>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                    {step == 3 ? <Button size={"sm"} onClick={() => setStep(step + 1)} type="button" id={"next"}>Próximo</Button> : null}
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="tags"
                            render={({ field }) => (
                                <FormItem className={`p-4 bg-muted rounded-md border ${step >= 4 ? null : "cursor-not-allowed opacity-50"}`}>
                                    <FormLabel>Tags (opcional)</FormLabel>
                                    <FormDescription className="!mt-0">
                                        Selecione as Tags de seu tópico.&nbsp; (Max: 6)
                                    </FormDescription>
                                    <div className='tag-row'>
                                        {tags.map((tag, key) => (
                                            <div key={key} className="tag text-white bg-primary">
                                                <span className='text-white'>{tag}</span>
                                                <span onClick={() => removeTag(tag)} className='close-tag'>
                                                    <XIcon size={20} />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <FormControl className={`${step >= 4 ? null : "cursor-not-allowed opacity-50"}`}>
                                        <FormControl>
                                            <CommandDemo tags={tags} step={step} onTagClick={handleTags} setTags={handleInputTag} value={inputTag} />
                                        </FormControl>

                                    </FormControl>
                                    <FormMessage className="m-1" />
                                    <Button className="mr-8 ml-1" size={'sm'} type="button" id={"tagbutton"} onClick={() => handleTags(inputTag)}>Adicionar tag</Button>

                                    {step == 4 && <Button size={"sm"} onClick={() => setStep(step + 1)} type="button" id={"next"}>Próximo</Button>}


                                </FormItem>
                            )}
                        />
                        <FormField

                            name="body"
                            render={({ field }) => (
                                <FormItem className={`p-4 rounded-md bg-muted border ${step >= 5 ? '' : "cursor-not-allowed opacity-50"}`}>
                                    <FormLabel>Corpo</FormLabel>
                                    <FormDescription className="!mt-0">
                                        Escreva aqui o corpo de seu tópico.
                                    </FormDescription>
                                    <FormControl>
                                        <Editor disabled={step >= 4 ? false : true} field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className={`${step >= 5 ? '' : "cursor-not-allowed opacity-50"} text-right`}>
                            <Button className={`${step >= 5 ? '' : "pointer-events-none"}`} type="submit">Criar tópico</Button>
                        </div>
                    </form>
                </Form>
            </div>
            <Footer />
        </Main>
    );
}
