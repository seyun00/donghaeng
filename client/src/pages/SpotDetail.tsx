import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FetchCommonInfo } from "../api/FetchTourApi";
import { FetchIntroInfo } from "../api/FetchTourApi";
import { FetchRepeatInfo } from "../api/FetchTourApi";
import { FetchDetailImages } from "../api/FetchTourApi";

export default function SpotDetail() {
  const { id } = useParams<{ id: string }>();
  const [common, setCommon] = useState<any>(null);
  const [intro, setIntro] = useState<any>(null);
  const [repeat, setRepeat] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchAll() {
      try {
        const [commonData, introData, repeatData, imageData] = await Promise.all([
          FetchCommonInfo(id!),
          FetchIntroInfo(id!),
          FetchRepeatInfo(id!),
          FetchDetailImages(id!),
        ]);
        setCommon(commonData);
        setIntro(introData);
        setRepeat(repeatData);
        setImages(imageData);
      } catch (err) {
        console.error("Error loading details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [id]);

  if (loading) return <p>로딩 중...</p>;
  if (!common) return <p>관광지 정보를 불러올 수 없습니다.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{common.title}</h1>
      {common.firstimage && (
        <img src={common.firstimage} alt={common.title} style={{ width: "100%", maxWidth: "600px" }} />
      )}

      <section>
        <h2>개요</h2>
        <p>{common.overview}</p>
      </section>

      <section>
        <h2>이용 정보</h2>
        <ul>
          {intro &&
            Object.entries(intro).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {String(value)}
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2>추가 정보</h2>
        {repeat.map((info, idx) => (
          <ul key={idx} style={{ marginBottom: "1em" }}>
            {Object.entries(info).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {String(value)}
              </li>
            ))}
          </ul>
        ))}
      </section>

      <section>
        <h2>갤러리</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {images.map((img, i) => (
            <img key={i} src={img.originimgurl} alt={`image-${i}`} style={{ width: "200px" }} />
          ))}
        </div>
      </section>

      <Link to="/placeInformation">
        <button style={{ marginTop: "20px" }}>목록으로</button>
      </Link>
    </div>
  );
}
