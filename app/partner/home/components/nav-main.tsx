"use client";

import { ChevronRight, HomeIcon, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  setActiveTab?: (tab: string) => void;
}

export function NavMain({ ...props }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-zinc-200">Platform</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuItem
            className="hover:bg-zinc-800 
          hover:text-zinc-200 text-zinc-200"
          >
            <SidebarMenuButton
              onClick={() =>
                props.setActiveTab?.("home") &&
                console.log("home")
              }
              tooltip={"menu"}
            >
              <HomeIcon />
              <span>{"Trang Chủ"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </Collapsible>
        {props.items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem
              className="hover:bg-zinc-800 
          hover:text-zinc-200 text-zinc-200"
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className=" hover:bg-zinc-800 hover:text-zinc-200 ">
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        onClick={() =>
                          props.setActiveTab?.(subItem.url ?? "") &&
                          console.log(subItem?.url)
                        }
                        // onClick={() => console.log(subItem?.url)}
                        className="text-zinc-200"
                        asChild
                      >
                        <a href={"#"}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
