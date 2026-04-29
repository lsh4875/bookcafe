export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  description: string;
  tag?: string;
}

export interface Curation {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  mood: string; // 카드 배경 분위기 키워드
  books: Book[];
}

export const CURATIONS: Curation[] = [
  {
    id: "1",
    title: "저시력자도 읽기 편한 책",
    subtitle: "눈이 편안한 책들을 모았어요",
    emoji: "👁",
    mood: "soft",
    books: [
      {
        id: "lv-1",
        title: "채식주의자",
        author: "한강",
        publisher: "창비",
        year: 2007,
        description:
          "대형 활자 판본이 있으며, 짧은 문장과 넓은 여백으로 읽는 피로가 적습니다.",
        tag: "대형활자 판본 있음",
      },
      {
        id: "lv-2",
        title: "아몬드",
        author: "손원평",
        publisher: "창비",
        year: 2017,
        description:
          "간결하고 명확한 문체로 쓰여 시각적 혼란 없이 집중해서 읽을 수 있습니다.",
        tag: "명확한 문체",
      },
      {
        id: "lv-3",
        title: "나는 나로 살기로 했다",
        author: "김수현",
        publisher: "마음의숲",
        year: 2016,
        description:
          "짧은 에세이 형식이라 한 번에 긴 문장을 읽지 않아도 되어 부담이 없습니다.",
        tag: "짧은 에세이",
      },
      {
        id: "lv-4",
        title: "죽고 싶지만 떡볶이는 먹고 싶어",
        author: "백세희",
        publisher: "흔",
        year: 2018,
        description:
          "대화체 중심의 가볍고 짧은 단락 구성으로 시각적 피로를 최소화합니다.",
        tag: "대화체, 짧은 단락",
      },
      {
        id: "lv-5",
        title: "어린 왕자",
        author: "생텍쥐페리",
        publisher: "열린책들",
        year: 1943,
        description:
          "삽화가 풍부하고 글밥이 적어 눈의 부담 없이 천천히 음미할 수 있습니다.",
        tag: "삽화 풍부",
      },
    ],
  },
  {
    id: "2",
    title: "지친 하루 끝에 읽기 좋은 책",
    subtitle: "오늘 하루도 수고했어요",
    emoji: "🌙",
    mood: "warm",
    books: [
      {
        id: "td-1",
        title: "완전한 행복",
        author: "정유정",
        publisher: "은행나무",
        year: 2021,
        description:
          "몰입감 넘치는 서사로 지친 마음을 잠시 잊게 해주는 소설입니다.",
        tag: "몰입 서사",
      },
      {
        id: "td-2",
        title: "82년생 김지영",
        author: "조남주",
        publisher: "민음사",
        year: 2016,
        description:
          "일상의 피로를 공감으로 위로해주는 이야기. 혼자가 아니라는 걸 느끼게 합니다.",
        tag: "공감과 위로",
      },
      {
        id: "td-3",
        title: "모든 것이 산산이 부서지다",
        author: "치누아 아체베",
        publisher: "민음사",
        year: 1958,
        description:
          "거대한 이야기 속에 나를 잠시 내려놓을 수 있는 책. 지친 날 강력히 추천합니다.",
      },
      {
        id: "td-4",
        title: "달러구트 꿈 백화점",
        author: "이미예",
        publisher: "팩토리나인",
        year: 2020,
        description:
          "따뜻하고 포근한 판타지. 잠들기 전 한두 챕터씩 읽기 딱 좋습니다.",
        tag: "잠들기 전 추천",
      },
      {
        id: "td-5",
        title: "오늘도 무사히",
        author: "김혼비",
        publisher: "위즈덤하우스",
        year: 2020,
        description:
          "일상의 작은 것들을 따뜻한 시선으로 담은 에세이. 읽고 나면 마음이 가벼워집니다.",
        tag: "에세이",
      },
    ],
  },
  {
    id: "3",
    title: "비 오는 날 읽기 좋은 책",
    subtitle: "빗소리와 함께 펼쳐봐요",
    emoji: "🌧",
    mood: "rain",
    books: [
      {
        id: "rd-1",
        title: "노르웨이의 숲",
        author: "무라카미 하루키",
        publisher: "문학사상",
        year: 1987,
        description:
          "빗소리가 배경음악이 되어주는 소설. 축축하고 감성적인 분위기와 완벽히 어울립니다.",
        tag: "비 오는 날 필독",
      },
      {
        id: "rd-2",
        title: "상실의 시대",
        author: "무라카미 하루키",
        publisher: "문학사상",
        year: 1987,
        description:
          "비 내리는 창가에서 읽으면 더 깊이 스며드는 그리움과 상실의 이야기입니다.",
      },
      {
        id: "rd-3",
        title: "데미안",
        author: "헤르만 헤세",
        publisher: "민음사",
        year: 1919,
        description:
          "비 오는 날의 내면 탐구에 제격. 조용히 자신을 들여다보고 싶을 때 읽어보세요.",
        tag: "내면 탐구",
      },
      {
        id: "rd-4",
        title: "구의 증명",
        author: "최진영",
        publisher: "은행나무",
        year: 2015,
        description:
          "빗속에서 읽으면 더 선명해지는 슬픔. 짧지만 오래 남는 소설입니다.",
        tag: "짧고 강렬한",
      },
      {
        id: "rd-5",
        title: "파친코",
        author: "이민진",
        publisher: "문학사상",
        year: 2017,
        description:
          "비 오는 긴 오후에 펼치기 좋은 방대한 서사. 시간 가는 줄 모르게 읽힙니다.",
        tag: "장편 몰입",
      },
    ],
  },
];

export function getCurationById(id: string): Curation | undefined {
  return CURATIONS.find((c) => c.id === id);
}
