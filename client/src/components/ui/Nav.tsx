import { Menu, Transition } from "@headlessui/react";

import { useState, Fragment } from "react";
import toast from "react-hot-toast";
import {
  FaBook,
  FaCaretDown,
  FaCog,
  FaListAlt,
  FaMoon,
  FaPowerOff,
  FaSun,
  FaTerminal,
  FaDesktop,
} from "react-icons/fa";
import { LiaBroomSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { AppClient } from "../../api";
import { usePopup } from "../../hooks/usePopup";
import { useSystemInfo } from "../../hooks/useSystemInfo";
import { useTheme } from "../../hooks/useTheme";
import { DocsPopup } from "../overlays/DocsPopup";
import { LogPopup } from "../overlays/LogPopup";
import { TerminalPopup } from "../overlays/TerminalPopup";
import { Button } from "./Button";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface NavProps {
  onConfigChange?: () => void;
}

export const Nav = ({ onConfigChange }: NavProps) => {
  const client = new AppClient();
  const navigate = useNavigate();
  const { isDark, themeMode, toggleTheme } = useTheme();

  const docsPopup = usePopup();
  const logPopup = usePopup();
  const terminalPopup = usePopup();

  const getThemeIcon = () => {
    if (themeMode === "system") return <FaDesktop />;
    return isDark ? <FaSun /> : <FaMoon />;
  };

  const getThemeTitle = () => {
    switch (themeMode) {
      case "system":
        return "Switch to Light Mode";
      case "light":
        return "Switch to Dark Mode";
      case "dark":
        return "Use System Default";
      default:
        return "Toggle Theme";
    }
  };

  return (
    <div>
      <nav className="border-gray-200 bg-gray-50 dark:bg-neutral-800 dark:border-neutral-600">
        <div className="container flex flex-wrap items-center justify-between mx-auto p-4 relative">
          <div className="flex items-center md:order-1"></div>

          <div className="flex basis-1/3 items-center md:order-1 font-semibold"></div>

          <div className="flex basis-1/3 justify-center md:order-2">
            <Link to={"/"} className={"hover:border-b"}>
              <span className={"text-sky-600 dark:text-sky-500"}>SIGHTS</span>
              <span className={"text-black dark:text-white"}> Interface</span>
            </Link>
          </div>

          <div className="flex basis-1/3 justify-end md:order-3 space-x-2">
            <div className="flex">
              <Button
                onClick={terminalPopup.openPopup}
                title={"Terminal"}
                color="text-gray-700 hover:text-white dark:text-white border border-gray-800 dark:border-white hover:bg-neutral-700 rounded-r-none border-r-0"
              >
                <FaTerminal />
              </Button>
              <Button
                onClick={logPopup.openPopup}
                title={"Logs"}
                color="text-gray-700 hover:text-white dark:text-white border border-gray-800 dark:border-white hover:bg-neutral-700 rounded-none border-r-0"
              >
                <FaListAlt />
              </Button>
              <Button
                onClick={docsPopup.openPopup}
                title={"Documentation"}
                color="text-gray-700 hover:text-white dark:text-white border border-gray-800 dark:border-white hover:bg-neutral-700 rounded-none border-r-0"
              >
                <FaBook />
              </Button>
              <Button
                onClick={() => navigate("/settings")}
                title={"Settings"}
                color="text-gray-700 hover:text-white dark:text-white border border-gray-800 dark:border-white hover:bg-neutral-700 rounded-l-none"
              >
                <FaCog />
              </Button>
            </div>

            <div className="flex">
              <Button
                onClick={toggleTheme}
                title={getThemeTitle()}
                color="text-gray-700 hover:text-white dark:text-white border border-gray-800 dark:border-white hover:bg-neutral-700 rounded-r-none border-r-0"
              >
                {getThemeIcon()}
              </Button>
              <Button
                onClick={() => {
                  localStorage.clear();
                  localStorage.setItem("theme-mode", themeMode);
                  window.dispatchEvent(new CustomEvent("resetSelectableCards"));
                }}
                title={"Clear layout selections"}
                color="text-gray-700 hover:text-white dark:text-white border border-gray-800 dark:border-white hover:bg-neutral-700 rounded-l-none"
              >
                <LiaBroomSolid />
              </Button>
            </div>

            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button
                  title={"Power"}
                  className="flex items-center focus:outline-none font-medium rounded-lg space-x-1 text-sm px-4 py-2.5 tracking-wide capitalize transition-colors duration-300 transform text-center ml-2 mr-3 md:mr-0 text-red-700 hover:text-white border border-red-800 hover:bg-red-800"
                >
                  <FaPowerOff />
                  <FaCaretDown />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black dark:ring-neutral-600 ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900 dark:bg-neutral-700 dark:text-white"
                              : "text-gray-700 dark:text-white",
                            "block px-4 py-2 text-sm",
                          )}
                          onClick={() => {
                            toast(<b>Power Off Signal Sent</b>);
                            client.default.powerPoweroffPost();
                          }}
                        >
                          Power off
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900 dark:bg-neutral-700 dark:text-white"
                              : "text-gray-700 dark:text-white",
                            "block px-4 py-2 text-sm",
                          )}
                          onClick={() => {
                            toast(<b>Reboot Signal Sent</b>);
                            client.default.rebootRebootPost();
                          }}
                        >
                          Reboot
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </nav>

      <DocsPopup isOpen={docsPopup.isOpen} onClose={docsPopup.closePopup} />

      <LogPopup isOpen={logPopup.isOpen} onClose={logPopup.closePopup} />

      <TerminalPopup
        isOpen={terminalPopup.isOpen}
        onClose={terminalPopup.closePopup}
      />
    </div>
  );
};
