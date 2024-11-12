import { writable } from 'svelte/store';
import { tick } from 'svelte';

export function createTextCycler({ texts, element, speed, stay, preText = '' }) {
  const { subscribe, set } = writable('');
  
  let charIdx = 0;
  let textIdx = 0;
  let intervalId;

  async function setTextContent() {
    const text = texts[textIdx];
    const textChunk = text.substring(0, charIdx + 1);
    document.querySelector(element).textContent = preText + ' ' + textChunk;
    await tick();
  }

  async function onTickReverse(afterReverse) {
    if (charIdx === 0) {
      afterReverse();
      clearInterval(intervalId);
      init(); 
    } else {
      setTextContent();
      charIdx--;
      await tick();
    }
  }

  function goReverse() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      onTickReverse(() => {
        charIdx = 0;
        textIdx = (textIdx + 1) % texts.length;
      });
    }, speed);
  }

  async function onTick() {
    const text = texts[textIdx];
    if (charIdx === text.length) {
      setTimeout(goReverse, stay);
    }
    setTextContent();
    charIdx++;
    await tick();
  }

  function init() {
    intervalId = setInterval(onTick, speed);
  }

  function kill() {
    clearInterval(intervalId);
  }

  init();

  return {
    subscribe,
    kill,
  };
}
